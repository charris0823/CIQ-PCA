import { useState, useEffect, Fragment, useRef } from "react";
import { useParams } from "react-router";
import useSWR, { useSWRConfig } from "swr";
import { get, genaiquery, swap, genairefresh } from "../../api/api";
import { Formatter } from "../../format";
import { TranscriptSegment } from "./TranscriptSegment";
import { Entities } from "./Entities";
import { ValueWithLabel } from "../../components/ValueWithLabel";
import { Placeholder } from "../../components/Placeholder";
import { Tag } from "../../components/Tag";
import { SentimentChart } from "./SentimentChart";
import { LoudnessChart } from "./LoudnessChart";
import { ComprehendSentimentChart } from "./ComprehendSentimentChart";
import { SpeakerTimeChart } from "./SpeakerTimeChart";
import { ListItems } from "./ListItems";
import { useDangerAlert } from "../../hooks/useAlert";
import "./dashboard.css";
import { getEntityColor } from "./colours";
import { TranscriptOverlay } from "./TranscriptOverlay";
import { range } from "../../util";
import { Sentiment } from "../../components/Sentiment";
import { ChatInput } from "../../components/ChatInput";
import { 
  Button, 
  ContentLayout, 
  Spinner, 
  Link, 
  Header, 
  Grid, 
  Container, 
  SpaceBetween, 
  Input, 
  FormField, 
  TextContent,
  Tabs,
  Box,
  ColumnLayout,
  Badge
} from '@cloudscape-design/components';

const getSentimentTrends = (d, target, labels) => {
  const id = Object.entries(labels).find(([_, v]) => v === target)?.[0];
  if (!id) return {};
  return d?.ConversationAnalytics?.SentimentTrends[id];
};

const createLoudnessData = (segment) => {
  const start = Math.floor(segment.SegmentStartTime);
  const end = Math.floor(segment.SegmentEndTime);
  const r = range(start, end);
  return r.map((item, i) => ({
    x: item,
    y: segment.LoudnessScores[i],
    interruption: segment.SegmentInterruption && item === start ? 100 : null,
    sentiment: (segment.SentimentIsNegative ? -5 : (segment.SentimentIsPositive && segment.LoudnessScores[i] > 0 ? 5 : 0)),
    sentimentScore: segment.SentimentScore,
    silence: (segment.LoudnessScores[i] === 0 ? true : false)
  }));
};

const createSentimentData = (segment) => {
  const start = Math.floor(segment.SegmentStartTime);
  const end = Math.floor(segment.SegmentEndTime);
  const r = range(start, end);
  return r.map((item, i) => ({
    x: item,
    y: (segment.SentimentIsNegative === 1 ? segment.SentimentScore * -1 : segment.SentimentScore)
  }));
}

function Dashboard({ setAlert }) {
  const { key } = useParams();
  const { mutate } = useSWRConfig();
  const audioElem = useRef();
  const transcriptElem = useRef();

  const { data, error } = useSWR(`/get/${key}`, () => get(key), {
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const isTranscribeCallAnalyticsMode =
    data?.ConversationAnalytics?.SourceInformation[0]?.TranscribeJobInfo
      ?.TranscribeApiType === "analytics";

  const hasTranscribeStreamingSession =
    data?.ConversationAnalytics?.SourceInformation[0]?.TranscribeJobInfo
      ?.StreamingSession;

  const usedCustomLanguageModel =
    data?.ConversationAnalytics?.SourceInformation[0]?.TranscribeJobInfo
        ?.CLMName;

  useDangerAlert(error, setAlert);

  const [speakerLabels, setSpeakerLabels] = useState({});
  const [loudnessData, setLoudnessData] = useState({});
  const [comprehendSentimentData, setComprehendSentimentData] = useState({});
  const [isSwapping, setIsSwapping] = useState(false);
  const [genAiQueries, setGenAiQueries] = useState([]);
  const [genAiQuery, setGenAiQuery] = useState("");
  const [genAiQueryStatus, setGenAiQueryStatus] = useState(false);

  const getValueFor = (input) =>
    Object.entries(speakerLabels).find(([_, label]) => label === input)?.[0];

  useEffect(() => {
    const labels = data?.ConversationAnalytics?.SpeakerLabels || [];
    const newSpeakerLabels = {
      NonTalkTime: "Silence",
      Interruptions: "Interruptions",
      Positive: "Positive",
      Negative: "Negative",
      Neutral: "Neutral"
    };
    labels.map(({ Speaker, DisplayText }) => {
      newSpeakerLabels[Speaker] = DisplayText;
    });
    setSpeakerLabels(newSpeakerLabels);
  }, [data]);
  
  useEffect(() => {
    const loudness = {};

    if (isTranscribeCallAnalyticsMode) {
      // TCA mode
      let interruptions = [];
      let silence = [];
      let positive = [];
      let negative = [];
      let neutral = [];
      let nonSilence = [];

      Object.keys(speakerLabels).forEach(key => {
        let keyLoudness = (data?.SpeechSegments || [])
        .filter((segment) => segment.SegmentSpeaker === key)
        .map(createLoudnessData)
        .flat();
        
        loudness[key] = keyLoudness;
        let newInterruptions = keyLoudness.filter((d) => d.interruption)
          .map((d) => ({ y: d.interruption, x: d.x }))
        interruptions = interruptions.concat(newInterruptions)

        let newSilence = keyLoudness.filter((d) => d.silence)
          .map((d) => ({ x: d.x, y: 100 }))
        silence = silence.concat(newSilence);

        keyLoudness.forEach((item) => {
          let sentimentItem = {
            x: item.x,
            y: 10,
            sentiment: item.sentiment
          };
          if (item.sentiment > 0) positive.push(sentimentItem)
          else if (item.sentiment < 0) negative.push(sentimentItem)
          else neutral.push(sentimentItem);
          nonSilence[item.x.toString()] = sentimentItem;
        });

      });
      
      // generate the rest of the silence
      if (data) {
        const r = range(0, parseInt(data?.ConversationAnalytics.Duration));
        r.map((item, i) => {
          if (!(i in nonSilence)) {
            silence = silence.concat({ x: i, y: 100 });
          }
        });
      }

      loudness['Interruptions'] = interruptions;
      loudness['NonTalkTime'] = silence;
      loudness['Positive'] = positive;
      loudness['Neutral'] = neutral;
      loudness['Negative'] = negative;
    } else {
      // this is transcribe standard
      Object.keys(speakerLabels).forEach(key => {
        if (key.indexOf('spk_') >= 0) {
          let keyLoudness = (data?.SpeechSegments || [])
          .filter((segment) => segment.SegmentSpeaker === key)
          .map(createSentimentData)
          .flat();
          console.log('keyloudness', keyLoudness);
          loudness[key] = keyLoudness;
        }
      });
    }
    console.log('Loudness', loudness);
    setLoudnessData(loudness);
  }, [speakerLabels])
  
  const getElementByIdAsync = id => new Promise(resolve => {
    const getElement = () => {
      const element = document.getElementById(id);
      if(element) {
        resolve(element);
      } else {
        requestAnimationFrame(getElement);
      }
    };
    getElement();
  });

  const scrollToBottomOfChat = async () => {
    const chatDiv = await getElementByIdAsync("chatDiv");
    chatDiv.scrollTop = chatDiv.scrollHeight + 200;
  }

  const submitQuery = (query) => {
    if (genAiQueryStatus === true) {
      return;
    }

    setGenAiQueryStatus(true);
    
    let responseData = {
      label: query,
      value: '...'
    }
    const currentQueries = genAiQueries.concat(responseData);
    setGenAiQueries(currentQueries);
    scrollToBottomOfChat(); 

    let query_response = genaiquery(key, query);
    query_response.then((data) => {
      const queries = currentQueries.map(query => {
        if (query.value !== '...') {
          return query;
        } else {
          return {
            label: query.label,
            value: data.response
          }
        }
      });
      setGenAiQueries(queries);
      scrollToBottomOfChat();
    });
    setGenAiQueryStatus(false);
  }

  const SummaryRefresh = () => {
    const [disabled, setDisabled] = useState(false);

    const onSubmit = async (e) => {
      e.preventDefault();
      setDisabled(true);
      await genairefresh(key);
      setDisabled(false);
      mutate(`/get/${key}`);

      return true;
    }

    return (
        <form onSubmit={onSubmit}>
          {disabled ? <Spinner size="big" variant="disabled"/> : <Button disabled={disabled} iconName="refresh" variant="normal" ariaLabel="refresh">
          </Button>}
        </form>
    );
  };

  const swapAgent = async () => {
    try {
      setIsSwapping(true);
      await swap(key);
      mutate(`/get/${key}`);
    } catch (err) {
      console.error(err);
      setAlert({
        heading: "Something went wrong",
        variant: "danger",
        text: "Unable to swap agent. Please try again later",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const setAudioCurrentTime = (e) => {
    const a = document.getElementsByTagName("audio")[0];
    a.currentTime = e.target.dataset.currenttime;
  };

  const audioEndTimestamps = (data?.SpeechSegments || [])
    .map(({WordConfidence}) => WordConfidence)
    .flat()
    .reduce((accumulator, item) => ([...accumulator, item.EndTime]),[]);

  const onAudioPlayTimeUpdate = () => {
    let elementEndTime = undefined;
    for (let i = 0; i < audioEndTimestamps.length; i++) {
      if (audioElem.current.currentTime < audioEndTimestamps[i]) {
        elementEndTime = audioEndTimestamps[i];
        break;
      }
    }

    [...transcriptElem.current.getElementsByClassName('playing')].map(elem => elem.classList?.remove("playing"));
    transcriptElem.current.querySelector('span[data-end="'+elementEndTime+'"]')?.classList?.add("playing");
  };

  const transcribeDetailColumn = [
    {
      label: "Type",
      value: (d) =>
        isTranscribeCallAnalyticsMode
          ? hasTranscribeStreamingSession
            ? "Transcribe Streaming Call Analytics"
            : "Transcribe Call Analytics"
          : hasTranscribeStreamingSession
            ? "Transcribe Streaming"
            : "Transcribe"
    },
    {
      label: "Job Id",
      value: (d) => (
        <div key='jobIdKey' className="text-break">
          {
            d?.ConversationAnalytics?.SourceInformation[0]?.TranscribeJobInfo
              ?.TranscriptionJobName
          }
        </div>
      ),
    },
    {
      label: "File Format",
      value: (d) =>
        d?.ConversationAnalytics?.SourceInformation[0]?.TranscribeJobInfo
          ?.MediaFormat,
    },
    {
      label: "Sample Rate",
      value: (d) =>
        d?.ConversationAnalytics?.SourceInformation[0]?.TranscribeJobInfo
          ?.MediaSampleRateHertz,
    },
    {
      label: "PII Redaction",
      value: (d) =>
        d?.ConversationAnalytics?.SourceInformation[0]?.TranscribeJobInfo
          ?.RedactedTranscript === true
          ? "Enabled"
          : "Disabled"
    },
    {
      label: "Custom Vocabulary",
      value: (d) =>
        d?.ConversationAnalytics?.SourceInformation[0]?.TranscribeJobInfo
          ?.VocabularyName,
    },
    {
      label: "Vocabulary Filter",
      value: (d) =>
        d.ConversationAnalytics.SourceInformation[0]?.TranscribeJobInfo
          ?.VocabularyFilter,
    },
    {
      label: "Average Word Confidence",
      value: (d) =>
        Formatter.Percentage(
          d.ConversationAnalytics.SourceInformation[0]?.TranscribeJobInfo
            ?.AverageWordConfidence
        ),
    },
  ];

  let genAiSummary = (data?.ConversationAnalytics?.Summary ?
    Object.entries(data?.ConversationAnalytics?.Summary).map(([key, value]) => {
    return {
      label: key,
      value: (value instanceof Array ? value.join(', ') : value)
    }
    }) : []);
  
  if (data?.ConversationAnalytics?.ContactSummary?.AutoGenerated?.OverallSummary?.Content) {
    // we also have a TCA summary
    genAiSummary = [{
      label: "Contact Summary",
      value: data?.ConversationAnalytics?.ContactSummary?.AutoGenerated?.OverallSummary?.Content
    }].concat(genAiSummary)
  };

  const icons = {
    issues: '⚠️',
    actionItems: '✅',
    outcomes: '🏁',
  };

  const AnalyticsSection = ({ title, items, icon, noItemsMessage }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <div
        style={{
          marginBottom: '20px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#f7f7f7',
            cursor: 'pointer',
            borderBottom: isOpen ? '1px solid #e0e0e0' : 'none',
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: '500', color: '#333' }}>
            <span style={{ marginRight: '8px', fontSize: '18px' }}>{icon}</span>
            {title}
          </h3>
          <span style={{ fontSize: '18px', color: '#666' }}>{isOpen ? '▲' : '▼'}</span>
        </div>
        {isOpen && (
          <div style={{ padding: '16px' }}>
            {items?.length > 0 ? (
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0 }}>
                {items.map((item, j) => (
                  <li key={j} style={{ marginBottom: '8px' }}>{item.Text}</li>
                ))}
              </ul>
            ) : (
              <div style={{ color: '#888' }}>{noItemsMessage}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Main component to render all analytics sections
  const AnalyticsSummary = ({ data }) => {
    const issues = data?.ConversationAnalytics?.IssuesDetected;
    const actionItems = data?.ConversationAnalytics?.ActionItemsDetected;
    const outcomes = data?.ConversationAnalytics?.OutcomesDetected;

    return (
      <div style={{ fontFamily: 'Google Sans, Roboto, sans-serif', padding: '16px' }}>
        <AnalyticsSection
          title="Issues"
          items={issues}
          icon={icons.issues}
          noItemsMessage="No issues detected."
        />
        <AnalyticsSection
          title="Action Items"
          items={actionItems}
          icon={icons.actionItems}
          noItemsMessage="No action items detected."
        />
        <AnalyticsSection
          title="Outcomes"
          items={outcomes}
          icon={icons.outcomes}
          noItemsMessage="No outcomes detected."
        />
      </div>
    );
  };

  // Key metrics for the top bar
  const KeyMetricsBar = () => (
    <Box padding="m" margin={{ bottom: "l" }}>
      <ColumnLayout columns={4} variant="text-grid">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#232f3e' }}>
            {data ? Formatter.Time(data.ConversationAnalytics.Duration) : '--:--'}
          </div>
          <div style={{ fontSize: '14px', color: '#687078' }}>Duration</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {data ? (
              <Sentiment
                score={getSentimentTrends(data, "Agent", speakerLabels)?.SentimentScore}
                trend={getSentimentTrends(data, "Agent", speakerLabels)?.SentimentChange}
              />
            ) : (
              <span style={{ color: '#687078' }}>--</span>
            )}
          </div>
          <div style={{ fontSize: '14px', color: '#687078' }}>Agent Sentiment</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {data ? (
              <Sentiment
                score={getSentimentTrends(data, "Customer", speakerLabels)?.SentimentScore}
                trend={getSentimentTrends(data, "Customer", speakerLabels)?.SentimentChange}
              />
            ) : (
              <span style={{ color: '#687078' }}>--</span>
            )}
          </div>
          <div style={{ fontSize: '14px', color: '#687078' }}>Customer Sentiment</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#232f3e' }}>
            {data?.ConversationAnalytics?.GUID?.substring(0, 8) || 'N/A'}
          </div>
          <div style={{ fontSize: '14px', color: '#687078' }}>Call ID</div>
        </div>
      </ColumnLayout>
    </Box>
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [data]);
  
  return (
    <ContentLayout 
      header={
        <div>
          <Header
            variant="h1"
            actions={[
              data && (
                <audio
                  key='audoiElem'
                  ref={audioElem}
                  style={{ marginRight: '16px' }}
                  controls
                  src={
                    data?.ConversationAnalytics?.SourceInformation[0]
                      ?.TranscribeJobInfo?.MediaFileUri
                  }
                  onTimeUpdate={onAudioPlayTimeUpdate}
                >
                  Your browser does not support the
                  <code>audio</code> element.
                </audio>
              ),
              <Button key='swapAgent' onClick={swapAgent} disabled={isSwapping}>
                {isSwapping ? "Swapping..." : "Swap Agent/Caller"}
              </Button>
            ]}
          >
            Call Analytics Dashboard
          </Header>
          <KeyMetricsBar />
        </div>
      }
    >
      {/* Three-column Layout: Analytics | AI Chat | Transcript */}
      <Grid gridDefinition={
        window.pcaSettings?.genai?.query ? [
          { colspan: { l: 3, m: 12, default: 12 } }, // Analytics sidebar
          { colspan: { l: 3, m: 12, default: 12 } }, // AI Chat sidebar
          { colspan: { l: 6, m: 12, default: 12 } }  // Transcript - center
        ] : [
          { colspan: { l: 4, m: 12, default: 12 } }, // Analytics sidebar - larger when no AI chat
          { colspan: { l: 8, m: 12, default: 12 } }  // Transcript 
        ]
      }>
        
        {/* Left Column: Analytics Sidebar with Tabs */}
        <Container>
          <Tabs
            tabs={[
                            {
                label: "Summary",
                id: "summary",
                content: (
                  <SpaceBetween size="l">
                    <div>
                      <Header 
                        variant="h3"
                        actions={<SummaryRefresh/>}
                      >
                        AI Insights
                      </Header>
                      <SpaceBetween size="m">
                        {genAiSummary.length > 0 ? genAiSummary.map((entry, i) => (
                          <ValueWithLabel key={i} label={entry.label}>
                            {entry.value}
                          </ValueWithLabel>
                        )) : <div>No Summary Available</div>}
                      </SpaceBetween>
                    </div>

                    {isTranscribeCallAnalyticsMode && (
                    <div>
                      <Header variant="h3">Call Analytics</Header>
                      <AnalyticsSummary data={data} />
                    </div>
                  )}
                  </SpaceBetween>
                )
              },
			  {
                label: "Analytics",
                id: "analytics",
                content: (
                  <SpaceBetween size="l">
                    <div>
                      <Header variant="h3">Sentiment Trends</Header>
                      <SentimentChart
                        data={data?.ConversationAnalytics?.SentimentTrends}
                        speakerOrder={speakerLabels}
                      />
                    </div>
                    
                    <div>
                      <Header variant="h3">Speaker Time</Header>
                      <SpeakerTimeChart
                        data={Object.entries(
                          data?.ConversationAnalytics?.SpeakerTime || {}
                        ).map(([key, value]) => ({
                          value: value.TotalTimeSecs,
                          label: speakerLabels[key],
                          channel: key
                        }))}
                        speakerOrder={speakerLabels}
                      />
                    </div>

                    {isTranscribeCallAnalyticsMode && (
                      <div>
                        <Header variant="h3">Loudness/Sentiment</Header>
                        {!loudnessData && !error ? (
                          <div>No Speakers</div>
                        ) : (
                          <LoudnessChart loudnessData={loudnessData} speakerLabels={speakerLabels} />
                        )}
                      </div>
                    )}

                    {!isTranscribeCallAnalyticsMode && (
                      <div>
                        <Header variant="h3">Comprehend Sentiment</Header>
                        {!loudnessData && !error ? (
                          <div>No Speakers</div>
                        ) : (
                          <ComprehendSentimentChart comprehendSentimentData={loudnessData} speakerLabels={speakerLabels} />
                        )}
                      </div>
                    )}
                  </SpaceBetween>
                )
              },
              {
                label: "Details",
                id: "details",
                content: (
                  <SpaceBetween size="l">
                    <div>
                      <Header variant="h3">Call Metadata</Header>
                      <SpaceBetween size="s">
                        <ValueWithLabel label="Timestamp">
                          {!data && !error ? (
                            <Placeholder />
                          ) : (
                            data?.ConversationAnalytics?.ConversationTime.substring(0, 19) || "-"
                          )}
                        </ValueWithLabel>
                        <ValueWithLabel label="Agent">
                          {!data && !error ? (
                            <Placeholder />
                          ) : (
                            data?.ConversationAnalytics?.Agent || "-"
                          )}
                        </ValueWithLabel>
                        <ValueWithLabel label="Language Model">
                          {!data && !error ? (
                            <Placeholder />
                          ) : (
                            usedCustomLanguageModel
                              ? data?.ConversationAnalytics?.LanguageCode + " [" +
                                data?.ConversationAnalytics?.SourceInformation[0]?.TranscribeJobInfo?.CLMName + "]"
                              : data?.ConversationAnalytics?.LanguageCode || "-"
                          )}
                        </ValueWithLabel>
                      </SpaceBetween>
                    </div>

                    <div>
                      <Header variant="h3">Transcribe Details</Header>
                      <SpaceBetween size="s">
                        {transcribeDetailColumn.slice(0, 4).map((entry, i) => (
                          <ValueWithLabel key={i} label={entry.label}>
                            {!data && !error ? (
                              <Placeholder />
                            ) : (
                              entry.value(data) || "-"
                            )}
                          </ValueWithLabel>
                        ))}
                      </SpaceBetween>
                    </div>

                    <div>
                      <Header variant="h3">Entities</Header>
                      {!data && !error ? (
                        <Placeholder />
                      ) : (
                        <Entities data={data?.ConversationAnalytics?.CustomEntities} />
                      )}
                    </div>

                    {isTranscribeCallAnalyticsMode && (
                      <div>
                        <Header variant="h3">Categories</Header>
                        {!data && !error ? (
                          <Placeholder />
                        ) : (
                          <ListItems
                            data={data?.ConversationAnalytics?.CategoriesDetected.map(
                              (category) => category.Name
                            )}
                          />
                        )}
                      </div>
                    )}
                  </SpaceBetween>
                )
              },
              ...(window.pcaSettings?.genai?.query ? [] : [{
                label: "AI Chat",
                id: "chat",
                content: (
                  <div style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
                    <Header variant="h3">Generative AI Query</Header>
                    <div 
                      id="chatDivFallback" 
                      style={{
                        flex: 1,
                        overflowY: 'auto', 
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}
                    >
                      <SpaceBetween size="m">
                        {genAiQueries.length > 0 ? genAiQueries.map((entry, i) => (
                          <ValueWithLabel key={i} index={i} label={entry.label}>
                            {entry.value === '...' ? (
                              <div style={{height:'30px'}}>
                                <Spinner/>
                              </div>
                            ) : (
                              entry.value
                            )}
                          </ValueWithLabel>
                        )) : (
                          <div style={{ textAlign: 'center', color: '#687078', padding: '32px' }}>
                            Ask a question below to get AI-powered insights about this call.
                          </div>
                        )}
                      </SpaceBetween>
                    </div>
                    <ChatInput submitQuery={submitQuery} />
                  </div>
                )
              }])
            ]}
          />
        </Container>

        {/* Center Column: AI Chat (if enabled) */}
        {window.pcaSettings?.genai?.query && (
          <Container
            header={
              <Header variant="h2">
                AI Assistant
              </Header>
            }
          >
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <div 
                id="chatDiv" 
                style={{
                  flex: 1,
                  overflowY: 'auto', 
                  padding: '12px',
                  backgroundColor: '#fafafa',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  minHeight: '200px'
                }}
              >
                {genAiQueries.length > 0 ? (
                  <SpaceBetween size="s">
                    {genAiQueries.map((entry, i) => (
                      <div key={i} style={{ marginBottom: '16px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#232f3e', 
                          marginBottom: '4px',
                          padding: '8px 12px',
                          backgroundColor: '#e1f5fe',
                          borderRadius: '12px 12px 12px 4px',
                          alignSelf: 'flex-end'
                        }}>
                          {entry.label}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#232f3e',
                          padding: '8px 12px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '12px 12px 4px 12px',
                          marginTop: '4px'
                        }}>
                          {entry.value === '...' ? (
                            <div style={{height:'20px'}}>
                              <Spinner size="small"/>
                            </div>
                          ) : (
                            entry.value
                          )}
                        </div>
                      </div>
                    ))}
                  </SpaceBetween>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#687078', 
                    padding: '32px 16px',
                    fontSize: '14px'
                  }}>
                    Ask questions about this call to get AI-powered insights.
                  </div>
                )}
              </div>
              <div style={{ marginTop: 'auto' }}>
                <ChatInput submitQuery={submitQuery} />
              </div>
            </div>
          </Container>
        )}

        {/* Right Column: Transcript */}
        <Container
          header={
            <Header variant="h2">
              Transcript
            </Header>
          }
        >
          <div 
            ref={transcriptElem}
            style={{ 
              height: '70vh', 
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '8px'
            }}
          >
            {!data && !error ? (
              <Placeholder />
            ) : (
              (data?.SpeechSegments || []).map((s, i) => (
                <TranscriptSegment
                  key={i}
                  name={speakerLabels[s.SegmentSpeaker]}
                  allSegments={s?.WordConfidence || []}
                  segmentStart={s.SegmentStartTime}
                  text={s.DisplayText}
                  onClick={setAudioCurrentTime}
                  highlightLocations={[
                    ...s.EntitiesDetected.map((e) => ({
                      start: e.BeginOffset,
                      end: e.EndOffset,
                      fn: (match, key, start, end, offsetStart, offsetEnd) => (
                        <TranscriptOverlay
                          key={key}
                          colour={getEntityColor(e.Type)}
                          visuallyHidden={`Entity - ${e.Type}`}
                          data-start={start}
                          data-end={end}
                          data-offset-start={offsetStart}
                          data-offset-end={offsetEnd}
                          content={match}
                          type={""}
                          entityOffsetStart={e.BeginOffset}
                          entityOffsetEnd={e.EndOffset}
                          entityClass={"text-danger"}
                          addType={offsetStart === e.BeginOffset ? true : false}
                        />
                      ),
                    })),
                    ...(s.IssuesDetected? s.IssuesDetected?.map((issue) => ({
                      start: issue.BeginOffset,
                      end: issue.EndOffset,
                      fn: (match, key, start, end, offsetStart, offsetEnd) => (
                        <TranscriptOverlay
                          key={key}
                          colour="#ffff00"
                          tooltip="Issue"
                          data-start={start}
                          data-end={end}
                          data-offset-start={offsetStart}
                          data-offset-end={offsetEnd}
                          content={match}
                          type={"Issue"}
                          entityOffsetStart={issue.BeginOffset}
                          entityOffsetEnd={issue.EndOffset}
                          entityClass={"text-danger"}
                          addType={offsetStart === issue.BeginOffset ? true : false}
                        />
                      ),
                    })) : []),
                    ...(s.ActionItemsDetected? s.ActionItemsDetected?.map((issue) => ({
                      start: issue.BeginOffset,
                      end: issue.EndOffset,
                      fn: (match, key, start, end, offsetStart, offsetEnd) => (
                        <TranscriptOverlay
                          key={key}
                          colour="lightpink"
                          tooltip="Action Item"
                          data-start={start}
                          data-end={end}
                          data-offset-start={offsetStart}
                          data-offset-end={offsetEnd}
                          content={match}
                          type={"Action Item"}
                          entityOffsetStart={issue.BeginOffset}
                          entityOffsetEnd={issue.EndOffset}
                          entityClass={"text-danger"}
                          addType={offsetStart === issue.BeginOffset ? true : false}
                        />
                      ),
                    })) : []),
                    ...(s.OutcomesDetected? s.OutcomesDetected?.map((issue) => ({
                      start: issue.BeginOffset,
                      end: issue.EndOffset,
                      fn: (match, key, start, end, offsetStart, offsetEnd) => (
                        <TranscriptOverlay
                          key={key}
                          colour="aquamarine"
                          tooltip="Outcome"
                          data-start={start}
                          data-end={end}
                          data-offset-start={offsetStart}
                          data-offset-end={offsetEnd}
                          content={match}
                          type={"Outcome"}
                          entityOffsetStart={issue.BeginOffset}
                          entityOffsetEnd={issue.EndOffset}
                          entityClass={"text-danger"}
                          addType={offsetStart === issue.BeginOffset ? true : false}
                        />
                      ),
                    })) : []),
                  ]}
                  score={s.SentimentIsPositive - s.SentimentIsNegative}
                  interruption={s.SegmentInterruption}
                  ivr={s?.IVRSegment || false}
                  categoryList={s.CategoriesDetected}
                />
              ))
            )}
          </div>
        </Container>
      </Grid>
    </ContentLayout>
  );
}

export default Dashboard;