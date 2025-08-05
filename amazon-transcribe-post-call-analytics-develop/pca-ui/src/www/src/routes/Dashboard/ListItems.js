import { ListGroup } from "react-bootstrap";
import { Tag } from "../../components/Tag";

export const ListItems = ({ data }) => {
  if (!data.length) {
    return (
      <p>
        No items to display. Email <a href="mailto:support@contact-iq.com">support@contact-iq.com</a> to add categories.
      </p>
    );
  }

  return (
    <ListGroup variant="flush">
      {data.map((v, i) => (
        <ListGroup.Item key={i}>
          <Tag>{v}</Tag>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};
