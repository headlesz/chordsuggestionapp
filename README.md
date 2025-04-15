# Chord Completion App

A web application that allows users to input chords on a music staff and get suggestions for complementary chord sequences using the Cerebras API.

## Video Demo:
https://youtu.be/an2Xq-nYsUk?si=F4NRvrOjKBl5yNXh

## Overview

This application enables musicians and composers to:

1. Input chords by clicking notes on a western music notation staff
2. Get AI-generated chord sequence suggestions that pair well with the input chord
3. View the suggested chord sequences along with their emotional qualities, complexity levels, and genre influences as determined by the Cerebras API

## Setup

1. Clone or download this repository
2. Open `index.html` in a web browser
3. To enable full functionality, update the API key in `script.js`

## API Configuration

To use the Cerebras API, you need to:

1. Obtain an API key from the Cerebras service
2. Open `script.js` and replace the placeholder API key:

```javascript
const API_KEY = 'YOUR_Cerebras_API_KEY'; // Replace with your actual API key
```

3. If necessary, update the API endpoint URL:

```javascript
const API_ENDPOINT = 'https://api.Cerebras.com/v1/chord-suggestions'; // Replace with actual endpoint
```

## How to Use

1. **Input a Chord**: Click on the staff to place notes. Each note represents a different pitch in the chord.
2. **Get Suggestions**: Click the "Get Chord Suggestions" button to receive AI-generated chord sequences.
3. **View Results**: The suggested chord sequences will appear below the staff, each with tags showing:
   - **Emotional Quality**: The emotional feel of the chord progression (happy, sad, tense, etc.)
   - **Complexity**: How complex the chord progression is (simple, moderate, complex)
   - **Genre Influence**: The musical genre that influences the progression (jazz, pop, classical, etc.)
4. **Clear and Start Over**: Use the "Clear Notes" button to remove all placed notes and start fresh.

## Technical Implementation

### Files

- `index.html`: Main HTML structure
- `styles.css`: CSS styling for the application
- `script.js`: JavaScript functionality

### Key Features

- **Interactive Music Staff**: Clickable grid for placing notes
- **Note Visualization**: Visual representation of placed notes
- **Preference Selection**: User controls for customizing suggestions
- **API Integration**: Connection to the Cerebras API for chord suggestions
- **Results Display**: Clean presentation of suggested chord sequences

### API Integration

The application sends the following data to the Cerebras API:

1. **Chord**: Array of note names with octaves (e.g., `["C4", "E4", "G4"]`)
2. **Include Attributes**: Specifies that the API should return emotion, complexity, and genre information:
   ```javascript
   include_attributes: {
     emotion: true,
     complexity: true,
     genre: true
   }
   ```

The API returns chord sequences with their emotional qualities, complexity levels, and genre influences, which are then displayed to the user. The sequences are sorted by these attributes for easier browsing.

## Development Notes

- The application includes a fallback for development that returns mock data when the API key hasn't been set
- For production use, ensure the API key is properly configured
- The UI is responsive and should work on various screen sizes

## Browser Compatibility

Tested and compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
