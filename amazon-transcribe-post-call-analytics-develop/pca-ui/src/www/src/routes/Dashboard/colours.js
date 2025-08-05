// src/components/colours.js

// This color palette is designed to complement the Material-UI theme.
// It uses shades of blue and gray for speakers and clear, distinct colors for
// sentiment and interruptions to ensure readability and a professional look.

export const colours = {
    // Speaker colors - A professional, desaturated palette
    'NonTalkTime': 'rgba(224, 224, 224, 0.7)', // A soft gray for non-talk time
    'IVR': 'rgba(103, 58, 183, 0.7)',         // A muted purple for IVR
    'spk_0': 'rgba(10, 85, 200, 0.8)',      // Made darker for better contrast
    'spk_1': 'rgba(100, 190, 255, 0.7)',      // Made lighter for better contrast
    'spk_2': 'rgba(128, 150, 168, 0.7)',     // A subtle slate gray
    'spk_3': 'rgba(49, 117, 186, 0.7)',      // A slightly darker blue
    'spk_4': 'rgba(23, 109, 194, 0.7)',      // Another shade of blue
    'spk_5': 'rgba(192, 202, 220, 0.7)',     // A very light blue-gray

    // Standard sentiment colors for immediate recognition
    'Positive': '#4CAF50', // Green for positive sentiment
    'Negative': '#f44336', // Red for negative sentiment
    'Neutral': '#9E9E9E',   // Gray for neutral sentiment

    // Interruption color - a clear, distinct color
    'Interruptions': '#FFC107', // Amber/Yellow for interruptions
};

// Colors for named entities, using a more coherent, subdued palette
const Entities = {
    COMMERCIAL_ITEM: "hsla(216, 98%, 52%, 0.2)", // Blue
    DATE: "hsla(263, 78%, 58%, 0.2)",            // Purple
    EVENT: "hsla(261, 51%, 51%, 0.2)",            // Violet
    LOCATION: "hsla(354, 70%, 54%, 0.2)",        // Red
    ORGANIZATION: "hsla(27, 98%, 54%, 0.2)",     // Orange
    OTHER: "hsla(45, 100%, 51%, 0.2)",           // Yellow
    PERSON: "hsla(152, 69%, 31%, 0.2)",          // Green
    QUANTITY: "hsla(162, 73%, 46%, 0.2)",        // Teal
    TITLE: "hsla(190, 90%, 50%, 0.2)",           // Cyan
    DEFAULT: "hsla(300, 90%, 51%, 0.2)",         // Magenta
};

export const getEntityColor = (type) => {
    if (type in Entities) {
        return Entities[type];
    }

    return Entities.DEFAULT;
};
