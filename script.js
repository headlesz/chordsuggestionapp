// Configuration
const API_KEY = 'YOUR_CEREBRUS_API_KEY'; // Replace with your actual API key
const API_ENDPOINT = 'https://api.cerberus.com/v1/chord-suggestions'; // Replace with actual endpoint

// Music notation constants
const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const OCTAVES = [2, 3, 4, 5, 6]; // Range of octaves on our staff

// State
let placedNotes = [];
let isLoading = false;
let selectedNoteIndex = -1; // Index of the currently selected note (-1 means no selection)

// DOM Elements (will be initialized in init function)
let notePositionsEl;
let placedNotesEl;
let clearBtn;
let submitBtn;
let chordSequencesEl;

// Initialize the application
function init() {
    // Initialize DOM elements
    notePositionsEl = document.getElementById('note-positions');
    placedNotesEl = document.getElementById('placed-notes');
    clearBtn = document.getElementById('clear-btn');
    submitBtn = document.getElementById('submit-btn');
    chordSequencesEl = document.getElementById('chord-sequences');
    
    // Make sure all elements are found
    if (!notePositionsEl || !placedNotesEl || !clearBtn || !submitBtn || !chordSequencesEl) {
        console.error('Could not find all required DOM elements');
        return;
    }
    
    createNotePositions();
    createAccidentalControls();
    setupEventListeners();
}

// Create accidental controls (sharp/flat buttons)
function createAccidentalControls() {
    const staffContainer = document.querySelector('.staff-container');
    
    // Create container for accidental controls
    const accidentalControls = document.createElement('div');
    accidentalControls.className = 'accidental-controls';
    
    // Create sharp button
    const sharpBtn = document.createElement('button');
    sharpBtn.className = 'accidental-btn';
    sharpBtn.textContent = '♯ Sharp';
    sharpBtn.addEventListener('click', () => applyAccidental('sharp'));
    
    // Create flat button
    const flatBtn = document.createElement('button');
    flatBtn.className = 'accidental-btn';
    flatBtn.textContent = '♭ Flat';
    flatBtn.addEventListener('click', () => applyAccidental('flat'));
    
    // Create natural button
    const naturalBtn = document.createElement('button');
    naturalBtn.className = 'accidental-btn';
    naturalBtn.textContent = '♮ Natural';
    naturalBtn.addEventListener('click', () => applyAccidental('natural'));
    
    // Add buttons to container
    accidentalControls.appendChild(sharpBtn);
    accidentalControls.appendChild(flatBtn);
    accidentalControls.appendChild(naturalBtn);
    
    // Add container to staff container
    staffContainer.appendChild(accidentalControls);
}

// Apply accidental to the selected note
function applyAccidental(accidentalType) {
    if (selectedNoteIndex === -1) {
        alert('Please select a note first');
        return;
    }
    
    const note = placedNotes[selectedNoteIndex];
    
    // Update the accidental
    if (accidentalType === 'sharp') {
        note.accidental = 'sharp';
        console.log('Applied sharp to note:', note);
    } else if (accidentalType === 'flat') {
        note.accidental = 'flat';
        console.log('Applied flat to note:', note);
    } else if (accidentalType === 'natural') {
        note.accidental = null;
        console.log('Applied natural to note:', note);
    }
    
    // Re-render the notes
    renderPlacedNotes();
}

// Create clickable positions on the staff for each note
function createNotePositions() {
    // Clear existing positions
    notePositionsEl.innerHTML = '';
    
    // Calculate positions for each note and octave
    // We'll create a grid of positions covering the staff
    const staffHeight = 200; // Height of our staff in pixels
    const staffWidth = notePositionsEl.offsetWidth;
    
// Create note positions for each octave and note
// Map notes to specific positions on the staff
// Bottom line (20%) should be E, top line (80%) should be F

// Define the staff lines positions (in percentage)
const STAFF_LINES = [0.2, 0.35, 0.5, 0.65, 0.8];

// Define which notes go on each line and space
// Modified to be descending with F on the top line
// Lines are F, D, B, G, E (top to bottom)
// Spaces are E, C, A, F (top to bottom)
const STAFF_NOTES = [
    { note: 'F', octave: 5, position: 0.2 },  // Top line
    { note: 'E', octave: 5, position: 0.275 }, // Space between lines 1 and 2
    { note: 'D', octave: 5, position: 0.35 },  // Line 2
    { note: 'C', octave: 5, position: 0.425 }, // Space between lines 2 and 3
    { note: 'B', octave: 4, position: 0.5 },   // Line 3
    { note: 'A', octave: 4, position: 0.575 }, // Space between lines 3 and 4
    { note: 'G', octave: 4, position: 0.65 },  // Line 4
    { note: 'F', octave: 4, position: 0.725 }, // Space between lines 4 and 5
    { note: 'E', octave: 4, position: 0.8 }    // Bottom line
];

// Create note positions for each defined staff position
STAFF_NOTES.forEach(staffNote => {
    // Create a single position that spans the entire width of the staff
    const notePosition = document.createElement('div');
    notePosition.className = 'note-position';
    notePosition.style.left = '0';
    notePosition.style.top = `${staffNote.position * 100}%`;
    notePosition.style.width = '100%'; // Make it span the full width
    notePosition.style.height = '20px'; // Fixed height
    notePosition.style.transform = 'translateY(-10px)'; // Center vertically
    
    // Store note data as attributes
    notePosition.dataset.note = staffNote.note;
    notePosition.dataset.octave = staffNote.octave;
    notePosition.dataset.y = staffNote.position;
    
    // Add click event to place a note
    notePosition.addEventListener('click', handleNotePositionClick);
    
    // Add a debug title to show the note when hovering
    notePosition.title = `${staffNote.note}${staffNote.octave}`;
    
    notePositionsEl.appendChild(notePosition);
});
}

// Handle click on a note position
function handleNotePositionClick(event) {
    console.log('Note position clicked');
    
    // Prevent event bubbling
    event.stopPropagation();
    
    const position = event.currentTarget;
    const note = position.dataset.note;
    const octave = position.dataset.octave;
    const y = parseFloat(position.dataset.y);
    
    // Fixed x position at 0.5 (50% from the left) to center notes in the staff
    const x = 0.5;
    
    console.log('Note data:', { note, octave, x, y });
    
    // Add note to our state
    placedNotes.push({
        note,
        octave: parseInt(octave),
        x,
        y,
        accidental: null // null = natural, 'sharp', or 'flat'
    });
    
    // Render the placed notes
    renderPlacedNotes();
}

// Render all placed notes on the staff
function renderPlacedNotes() {
    // Clear existing notes
    placedNotesEl.innerHTML = '';
    
    // Create a visual element for each placed note
    placedNotes.forEach((note, index) => {
        const noteEl = document.createElement('div');
        noteEl.className = 'placed-note';
        if (index === selectedNoteIndex) {
            noteEl.classList.add('selected-note');
        }
        
        noteEl.style.left = `${note.x * 100}%`;
        noteEl.style.top = `${note.y * 100}%`;
        
        // Display the note letter in the center
        noteEl.textContent = note.note;
        
        // Add accidental symbol if needed
        if (note.accidental) {
            const accidentalEl = document.createElement('span');
            accidentalEl.className = 'note-accidental';
            
            if (note.accidental === 'sharp') {
                accidentalEl.textContent = '♯';
            } else if (note.accidental === 'flat') {
                accidentalEl.textContent = '♭';
            }
            
            // Append the accidental element to the DOM
            noteEl.appendChild(accidentalEl);
            console.log('Added accidental to note:', note.accidental);
        }
        
        // Add a tooltip showing the full note name
        let noteName = note.note;
        if (note.accidental === 'sharp') noteName += '♯';
        if (note.accidental === 'flat') noteName += '♭';
        noteEl.title = `${noteName}${note.octave}`;
        
        // Add click event to select this note
        noteEl.addEventListener('click', (event) => {
            event.stopPropagation();
            selectNote(index);
        });
        
        placedNotesEl.appendChild(noteEl);
    });
}

// Select a note
function selectNote(index) {
    selectedNoteIndex = index;
    renderPlacedNotes();
}

// Clear all placed notes
function clearNotes() {
    placedNotes = [];
    selectedNoteIndex = -1;
    renderPlacedNotes();
    chordSequencesEl.innerHTML = '';
}

// Get chord suggestions from the API
async function getChordSuggestions() {
    if (placedNotes.length === 0) {
        alert('Please place at least one note on the staff.');
        return;
    }
    
    // Show loading state
    isLoading = true;
    submitBtn.textContent = 'Loading...';
    submitBtn.disabled = true;
    
    try {
        // Sort the notes by octave and note name to find the lowest note
        const sortedNotes = [...placedNotes].sort((a, b) => {
            // First compare by octave
            if (a.octave !== b.octave) {
                return a.octave - b.octave;
            }
            
            // If octaves are the same, compare by note name
            // Convert note names to numeric values (C=0, D=1, etc.)
            const noteValues = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
            return noteValues[a.note] - noteValues[b.note];
        });
        
        // The lowest note is the first one after sorting
        const rootNote = sortedNotes[0];
        console.log('Root note (lowest note):', rootNote);
        
        // Format the notes into a chord representation
        const chord = placedNotes.map(note => `${note.note}${note.octave}`);
        
        // Make API request with the root note information
        const response = await fetchChordSuggestions(chord, rootNote);
        
        // Display the results
        displayChordSequences(response.sequences);
    } catch (error) {
        console.error('Error getting chord suggestions:', error);
        alert('Failed to get chord suggestions. Please try again.');
    } finally {
        // Reset loading state
        isLoading = false;
        submitBtn.textContent = 'Get Chord Suggestions';
        submitBtn.disabled = false;
    }
}

// This function has been replaced by the implementation at the bottom of the file

// Display chord sequences in the UI
function displayChordSequences(sequences) {
    // Clear existing sequences
    chordSequencesEl.innerHTML = '';
    
    if (!sequences || sequences.length === 0) {
        chordSequencesEl.innerHTML = '<p>No chord sequences found. Try different notes.</p>';
        return;
    }
    
    // Sort sequences by attributes if needed
    // For example, sort by emotion
    sequences.sort((a, b) => {
        // First sort by emotion
        if (a.emotion && b.emotion) {
            return a.emotion.localeCompare(b.emotion);
        }
        // Then by complexity
        if (a.complexity && b.complexity) {
            return a.complexity.localeCompare(b.complexity);
        }
        // Then by genre
        if (a.genre && b.genre) {
            return a.genre.localeCompare(b.genre);
        }
        return 0;
    });
    
    // Create a card for each sequence
    sequences.forEach((sequence, index) => {
        const sequenceEl = document.createElement('div');
        sequenceEl.className = 'chord-sequence';
        
        // Create header with sequence number
        const header = document.createElement('h3');
        header.textContent = `Sequence ${index + 1}`;
        
        // Add attributes from Cerberus API
        const attributesContainer = document.createElement('div');
        attributesContainer.className = 'attributes-container';
        
        // Add emotion tag if available
        if (sequence.emotion) {
            const emotionTag = document.createElement('span');
            emotionTag.className = 'attribute-tag emotion-tag';
            emotionTag.textContent = sequence.emotion;
            attributesContainer.appendChild(emotionTag);
        }
        
        // Add complexity rating if available
        if (sequence.complexityRating !== undefined) {
            const rating = parseFloat(sequence.complexityRating);
            const complexityTag = document.createElement('span');
            complexityTag.className = 'attribute-tag complexity-tag';
            
            // Calculate color based on complexity rating (0-10)
            // 0 = green (rgb(0, 200, 0)), 10 = red (rgb(200, 0, 0))
            const red = Math.round((rating / 10) * 200);
            const green = Math.round((1 - rating / 10) * 200);
            complexityTag.style.backgroundColor = `rgb(${red}, ${green}, 0)`;
            
            // Ensure text is readable on any background
            complexityTag.style.color = rating > 5 ? 'white' : 'black';
            
            // Display the rating
            complexityTag.textContent = `Complexity: ${rating}/10`;
            attributesContainer.appendChild(complexityTag);
        } else if (sequence.complexity) {
            // Fallback for old format
            const complexityTag = document.createElement('span');
            complexityTag.className = 'attribute-tag complexity-tag';
            complexityTag.textContent = sequence.complexity;
            attributesContainer.appendChild(complexityTag);
        }
        
        // Add genre tag if available
        if (sequence.genre) {
            const genreTag = document.createElement('span');
            genreTag.className = 'attribute-tag genre-tag';
            genreTag.textContent = sequence.genre;
            attributesContainer.appendChild(genreTag);
        }
        
        header.appendChild(attributesContainer);
        sequenceEl.appendChild(header);
        
        // Create chord progression display
        const chordsContainer = document.createElement('div');
        chordsContainer.className = 'chords-container';
        
        // Add each chord in the sequence with its Roman numeral
        sequence.chords.forEach((chord, idx) => {
            const chordEl = document.createElement('span');
            chordEl.className = 'chord';
            
            // Get the corresponding Roman numeral if available
            const numeral = sequence.numerals && sequence.numerals[idx] ? sequence.numerals[idx] : '';
            
            // Display both the chord and its Roman numeral
            chordEl.innerHTML = `<span class="chord-name">${chord}</span>` + 
                               (numeral ? `<span class="chord-numeral">${numeral}</span>` : '');
            
            chordsContainer.appendChild(chordEl);
        });
        
        sequenceEl.appendChild(chordsContainer);
        chordSequencesEl.appendChild(sequenceEl);
    });
    
    // Group sequences by attributes if needed
    // This could be an alternative to sorting
    /*
    const groupedSequences = {};
    sequences.forEach(sequence => {
        const key = sequence.emotion || 'Unknown';
        if (!groupedSequences[key]) {
            groupedSequences[key] = [];
        }
        groupedSequences[key].push(sequence);
    });
    
    // Display grouped sequences
    Object.keys(groupedSequences).forEach(emotion => {
        const groupHeader = document.createElement('h3');
        groupHeader.textContent = emotion;
        chordSequencesEl.appendChild(groupHeader);
        
        groupedSequences[emotion].forEach(sequence => {
            // Display sequence as above
        });
    });
    */
}

// Set up event listeners
function setupEventListeners() {
    clearBtn.addEventListener('click', clearNotes);
    submitBtn.addEventListener('click', getChordSuggestions);
    
    // Handle window resize to recalculate note positions
    window.addEventListener('resize', createNotePositions);
    
    // Handle clicks on the staff container to deselect notes
    document.querySelector('.staff').addEventListener('click', () => {
        selectedNoteIndex = -1;
        renderPlacedNotes();
    });
}

// Helper function to calculate Roman numerals based on chord relationships
function calculateRomanNumerals(rootNoteName, chords) {
    console.log('Calculating Roman numerals with root note:', rootNoteName);
    
    // Define the major and minor scales for each root note
    const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11]; // Intervals in semitones from the root
    const minorScaleIntervals = [0, 2, 3, 5, 7, 8, 10]; // Natural minor scale intervals
    
    // Define the Roman numerals for major and minor scales
    const majorNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    const minorNumerals = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
    
    // Define the chromatic scale starting from C
    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Extract the root note name without accidentals
    const baseRootNote = rootNoteName.charAt(0);
    
    // Find the position of the root note in the chromatic scale
    const rootIndex = chromaticScale.indexOf(baseRootNote);
    if (rootIndex === -1) {
        console.error('Root note not found in chromatic scale:', rootNoteName);
        return chords.map((chord, index) => index === 0 ? 'I' : 'IV'); // Default to I for first chord, IV for others
    }
    
    // Determine if the first chord is major or minor to decide which scale to use
    const firstChord = chords[0];
    const firstChordIsMinor = firstChord && (
        firstChord.toLowerCase().includes('min') || 
        firstChord.toLowerCase().includes('m7') ||
        firstChord.toLowerCase().includes('m9')
    );
    
    // Choose the appropriate scale and numerals based on the first chord
    const scaleIntervals = firstChordIsMinor ? minorScaleIntervals : majorScaleIntervals;
    const scaleNumerals = firstChordIsMinor ? minorNumerals : majorNumerals;
    
    // Build the scale starting from the root note
    const scale = scaleIntervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return chromaticScale[noteIndex];
    });
    
    console.log('Using scale:', scale, 'with numerals:', scaleNumerals);
    
    // Calculate Roman numerals for each chord
    return chords.map((chord, index) => {
        // Extract the root of the chord (e.g., "C" from "CMaj7")
        const chordRoot = chord.charAt(0);
        
        // For the first chord in the sequence, always return "I" or "i"
        if (index === 0 && chordRoot === baseRootNote) {
            // Return "i" for minor, "I" for major
            let numeral = firstChordIsMinor ? 'i' : 'I';
            
            // Add extensions if present in the chord
            if (chord.includes('7')) {
                numeral += '7';
            } else if (chord.includes('9')) {
                numeral += '9';
            } else if (chord.includes('6')) {
                numeral += '6';
            }
            
            return numeral;
        }
        
        // Find the position of the chord root in the scale
        const scalePosition = scale.findIndex(note => note === chordRoot);
        
        if (scalePosition !== -1) {
            // The chord root is in the scale, use the corresponding Roman numeral
            let numeral = scaleNumerals[scalePosition];
            
            // Determine if the chord is major or minor
            const chordIsMinor = chord.toLowerCase().includes('min') || 
                               chord.toLowerCase().includes('m7') ||
                               chord.toLowerCase().includes('m9');
            
            // Adjust for chord quality if needed
            if (chordIsMinor && numeral.toUpperCase() === numeral) {
                // If the numeral is uppercase (major) but the chord is minor
                numeral = numeral.toLowerCase();
            } else if (!chordIsMinor && numeral.toLowerCase() === numeral && !numeral.includes('°')) {
                // If the numeral is lowercase (minor) but the chord is major
                // Don't change diminished chords (vii°)
                numeral = numeral.toUpperCase();
            }
            
            // Add extensions if present in the chord
            if (chord.includes('7')) {
                numeral += '7';
            } else if (chord.includes('9')) {
                numeral += '9';
            } else if (chord.includes('6')) {
                numeral += '6';
            }
            
            return numeral;
        } else {
            // The chord root is not in the scale, try to find the closest match
            // For simplicity, we'll default to a common progression
            console.warn('Chord root not found in scale:', chordRoot);
            return index === 1 ? 'IV' : index === 2 ? 'V' : 'vi';
        }
    });
}

// Helper function to check if two Roman numerals are equivalent
function areRomanNumeralsEquivalent(numeral1, numeral2) {
    // Normalize the numerals by removing extensions
    const normalize = (numeral) => {
        // Remove extensions like 7, 9, etc.
        return numeral.replace(/[0-9]/g, '');
    };
    
    const base1 = normalize(numeral1);
    const base2 = normalize(numeral2);
    
    // Check if the base numerals are the same
    return base1.toLowerCase() === base2.toLowerCase();
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app');
    // Wait a short time to ensure all elements are fully rendered
    setTimeout(init, 100);
});

// Fallback initialization in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM already loaded, initializing app');
    setTimeout(init, 100);
}

// Fetch chord suggestions from the Cerberus API
async function fetchChordSuggestions(chord, rootNote) {
    console.log('Sending chord data to Cerberus API:', chord);
    console.log('Root note for Roman numeral calculation:', rootNote);
    
    // Format the chord data for the API request
    const chordString = chord.join(', ');
    
    // Create a prompt for the Cerberus API
    const prompt = `I have a chord with the following notes: ${chordString}. 
    The lowest note is ${rootNote.note}${rootNote.octave}, which should be considered the root note of the "I" chord in the sequence. The chord is either major on minor depending on the notes.
    Assume tonality based on the root chord. 
    If only one note is present, assume the chord is major, again, the note is the root note of the "I" chord.
    Example:
    If there is only an F note present, the "I" chord would be FMajor.
    Do not default to C major.

    Please suggest 5 chord sequences that would work well with this chord.
    For each sequence, provide:
    1. The emotional quality (happy, melancholic, tense, relaxed, etc.)
    2. The complexity rating on a scale from 0 to 10, where 0 is extremely simple and 10 is extremely complex
    3. The genre influence (jazz, pop, classical, folk, etc.)
    4. A sequence of 4-5 chords that would work well with this chord.
    5. The Roman numeral notation for each chord in the sequence, assuming the input chord with root ${rootNote.note} is the "I" chord.
   
    Constructing a scale, major or minor, depending on the chord quality determined above, find the suggest chords' position in the scale.
    IMPORTANT: For the chord names, please use proper chord notation with extensions, NOT octave numbers. 
    For example, use "CMaj7", "Cmin", "Cadd9", "G7", "Dm7b5", etc. instead of "C5", "G4", etc.
    
    
    Format your response as a JSON object with a 'sequences' array containing objects with 'emotion', 'complexityRating' (a number from 0-10), 'genre', 'chords', and 'numerals' properties.
    
    Example: If the input chord has A as the lowest note (A C E), and one of the suggested chords is D minor (D F A), the Roman numeral would be "iv" since D minor is the 4th chord in the A minor scale.
    Double check that the roman numerial is correct, do NOT send an incorrect roman numerial`;
    
    try {
        // Make the API request to Cerberus
        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'User-Agent': 'ChordCompletionApp/1.0'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama3.1-8b',
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Cerberus API response:', data);
        
        // Extract the content from the response
        const content = data.choices[0].message.content;
        
        // Parse the JSON from the content
        // The AI might return the JSON with some extra text, so we need to extract it
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON from API response');
        }
        
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // If the response doesn't have the expected format, create a default structure
        if (!parsedData.sequences) {
            console.warn('API response did not contain sequences, creating default structure');
            return {
                sequences: [
                    {
                        emotion: 'Happy',
                        complexityRating: 3,
                        genre: 'Pop',
                        chords: ['CMaj7', 'Am7', 'FMaj7', 'G7'],
                        numerals: ['IMaj7', 'vi7', 'IVMaj7', 'V7']
                    },
                    {
                        emotion: 'Melancholic',
                        complexityRating: 7,
                        genre: 'Jazz',
                        chords: ['Dm7', 'G7', 'CMaj7', 'Bm7b5', 'E7'],
                        numerals: ['ii7', 'V7', 'IMaj7', 'vii7b5', 'III7']
                    }
                ]
            };
        }
        
        // Process the chord names to ensure they have proper extensions
        parsedData.sequences.forEach(sequence => {
            sequence.chords = sequence.chords.map(chord => {
                // If the chord has a number that looks like an octave (e.g., C5, G4), replace it with a proper extension
                if (/^[A-G][#b]?\d$/.test(chord)) {
                    // Extract the note name
                    const noteName = chord.replace(/\d$/, '');
                    // Replace with a simple triad by default
                    return noteName;
                }
                return chord;
            });
        });
        
        // Calculate and validate Roman numerals
        parsedData.sequences.forEach(sequence => {
            // If numerals are missing, calculate them
            if (!sequence.numerals || sequence.numerals.length !== sequence.chords.length) {
                sequence.numerals = calculateRomanNumerals(rootNote.note, sequence.chords);
            } else {
                // Validate and correct the Roman numerals
                const calculatedNumerals = calculateRomanNumerals(rootNote.note, sequence.chords);
                
                // Compare and correct if needed
                sequence.numerals = sequence.numerals.map((numeral, idx) => {
                    // If the numeral doesn't match our calculation, use our calculation
                    if (idx < calculatedNumerals.length && 
                        !areRomanNumeralsEquivalent(numeral, calculatedNumerals[idx])) {
                        console.log(`Correcting Roman numeral: ${numeral} -> ${calculatedNumerals[idx]}`);
                        return calculatedNumerals[idx];
                    }
                    return numeral;
                });
            }
        });
        
        return parsedData;
    } catch (error) {
        console.error('Error calling Cerberus API:', error);
        
        // Return fallback data in case of error
        return {
            sequences: [
                {
                    emotion: 'Happy',
                    complexityRating: 3,
                    genre: 'Pop',
                    chords: ['CMaj7', 'Am7', 'FMaj7', 'G7'],
                    numerals: ['IMaj7', 'vi7', 'IVMaj7', 'V7']
                },
                {
                    emotion: 'Melancholic',
                    complexityRating: 7,
                    genre: 'Jazz',
                    chords: ['Dm7', 'G7', 'CMaj7', 'Bm7b5', 'E7'],
                    numerals: ['ii7', 'V7', 'IMaj7', 'vii7b5', 'III7']
                }
            ]
        };
    }
}
