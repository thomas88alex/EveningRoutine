// Define available icons
const availableIcons = [
    '🧹', '👕', '🎒', '🚿', '🦷', '🚽', '🛌', '🌙', '☀️', '📚', '🍎', '🥪', '🥛', '🧸', '✨', '🧼', '👟', '🧥', '<0xF0><0x9F><0xA5><0xBD>', '😊', '⭐', '💖', '🎉', '📅', '⏰', '🏠', '🍽️', '🎶', '🎨', '⚽',
    // Added clothes/related icons:
    '👚', // Woman's Clothes
    '👔', // Necktie (Shirt)
    '👖', // Jeans
    '👗', // Dress
    '<0xF0><0x9F><0xA7><0xA6>', // Shorts
    '<0xF0><0x9F><0xA7><0xA4>', // Socks
    '👟', // Running Shoe (duplicate, but good context)
    '<0xF0><0x9F><0xA7><0xBD>', // Flat Shoe
    '<0xF0><0x9F><0xA7><0xBE>', // Hiking Boot
    '<0xF0><0x9F><0xA7><0x83>', // Scarf
    '<0xF0><0x9F><0xA7><0x82>', // Gloves
    // Hair/Brush related icons:
    '<0xF0><0x9F><0xA7><0xB4>', // Comb
    '<0xF0><0x9F><0xA7><0xB5>', // Hair Pick
    '💇‍♀️', // Woman Getting Haircut (Hair Care)
    '💇' // Person Getting Haircut (Hair Care)
];

// Define available colors
const availableColors = [
    { id: 'blue', name: 'Blue', light: '#a8d8f0', dark: '#4a90e2' },
    { id: 'green', name: 'Green', light: '#a8e6cf', dark: '#4caf50' },
    { id: 'yellow', name: 'Yellow', light: '#fff59d', dark: '#fbc02d' },
    { id: 'pink', name: 'Pink', light: '#f8bbd0', dark: '#e91e63' },
    { id: 'purple', name: 'Purple', light: '#d1c4e9', dark: '#9c27b0' },
    { id: 'orange', name: 'Orange', light: '#ffccbc', dark: '#ff7043' },
    { id: 'teal', name: 'Teal', light: '#b2dfdb', dark: '#009688' },
    { id: 'red', name: 'Red', light: '#ffcdd2', dark: '#e53935' },
    { id: 'lime', name: 'Lime', light: '#e6ee9c', dark: '#c0ca33' },
    { id: 'cyan', name: 'Cyan', light: '#b2ebf2', dark: '#00bcd4' },
    { id: 'indigo', name: 'Indigo', light: '#c5cae9', dark: '#3f51b5' },
    { id: 'amber', name: 'Amber', light: '#ffecb3', dark: '#ffc107' },
    { id: 'brown', name: 'Brown', light: '#d7ccc8', dark: '#795548' },
    { id: 'grey', name: 'Grey', light: '#e0e0e0', dark: '#757575' },
    { id: 'deep-purple', name: 'Deep Purple', light: '#b39ddb', dark: '#673ab7' },
    { id: 'light-green', name: 'Light Green', light: '#c8e6c9', dark: '#8bc34a' }
];

// Helper function to convert HEX to RGBA
function hexToRgba(hex, alpha = 1) {
    // Remove '#' if present
    hex = hex.replace('#', '');

    // Handle 3-digit hex
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // Check for valid 6-digit hex
    if (hex.length !== 6 || /[^0-9a-fA-F]/.test(hex)) {
        console.warn("Invalid hex color format for conversion:", '#' + hex);
        return null; // Return null for invalid formats
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Clamp alpha between 0 and 1
    alpha = Math.max(0, Math.min(1, alpha));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Default tasks if nothing in localStorage
    const defaultTasks = [
        { id: 0, name: 'Clean up rooms', duration: 10, icon: '🧹', colorId: 'blue', isActive: true },
        { id: 1, name: 'Prepare clothes', duration: 5, icon: '👕', colorId: 'green', isActive: true },
        { id: 2, name: 'Pack school bag', duration: 5, icon: '🎒', colorId: 'yellow', isActive: true },
        { id: 3, name: 'Shower', duration: 10, icon: '🚿', colorId: 'pink', isActive: true },
        { id: 4, name: 'Brush teeth', duration: 3, icon: '🦷', colorId: 'purple', isActive: true },
        { id: 5, name: 'Toilet', duration: 2, icon: '🚽', colorId: 'orange', isActive: true },
        { id: 6, name: 'Pyjamas', duration: 2, icon: '<0xF0><0x9F><0xA5><0xBD>', colorId: 'teal', isActive: true },
        { id: 7, name: 'Dad time', duration: 13, icon: '👨‍👧', colorId: 'red', isActive: true }
    ];

    // Load tasks from localStorage or use defaults
    let tasks = JSON.parse(localStorage.getItem('routineTasks')) || defaultTasks;

    // Ensure loaded tasks have all necessary properties
    tasks = tasks.map((task, index) => {
        const defaultTaskMatch = defaultTasks.find(dt => dt.id === task.id);
        const { optional, ...restOfTask } = task; // Destructure to remove optional if loaded
        return {
            icon: availableIcons[0],
            colorId: availableColors[0].id,
            isActive: true,
            ...defaultTaskMatch, // Apply defaults
            ...restOfTask, // Apply loaded data (without optional)
            id: restOfTask.id !== undefined ? restOfTask.id : Date.now() + index,
            duration: parseInt(restOfTask.duration, 10) || 1,
            // Reset runtime state
            completed: false,
            skipped: false, // Keep skipped internally for now? Or remove?
            startTime: null,
            endTime: null
        };
    });

    // Filtered list for the main routine view
    let activeTasks = [];

    const progressBar = document.getElementById('progressBar');
    const timeMarker = document.getElementById('timeMarker');
    const taskListElement = document.getElementById('taskList');
    const startButton = document.getElementById('startButton');
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsButton = document.getElementById('closeSettingsButton');
    const settingsTaskList = document.getElementById('settingsTaskList');
    const addNewTaskButton = document.getElementById('addNewTaskButton');
    const settingsTotalMinutes = document.getElementById('settingsTotalMinutes');
    const timerDisplay = document.getElementById('timerDisplay');
    const runtimeControls = document.getElementById('runtimeControls');
    const pauseResumeButton = document.getElementById('pauseResumeButton');
    const restartButton = document.getElementById('restartButton');
    const adjustTimeMinusButton = document.getElementById('adjustTimeMinusButton');
    const adjustTimePlusButton = document.getElementById('adjustTimePlusButton');

    let totalMinutes = tasks.reduce((sum, task) => sum + (task.isActive ? (task.duration || 0) : 0), 0); // Calculate total minutes from tasks
    console.log(`Total routine time calculated from tasks: ${totalMinutes} minutes`);

    // Ensure totalMinutes is at least 1 to avoid division by zero
    if (totalMinutes < 1) {
        console.warn("Task durations add up to less than 1 minute. Setting total time to 60 minutes.");
        totalMinutes = 60;
        // Optionally, redistribute time or add a buffer task here if needed
    }

    let routineStartTime = null;
    let timerInterval = null;
    let elapsedSeconds = 0; // Track time in seconds for accuracy
    let currentMinuteMarker = 0; // Tracks the current minute for marker updates
    let currentTaskIndex = 0;
    let routineRunning = false;
    let isPaused = false;
    let pausedTime = 0;

    // Function to format seconds into MM:SS
    function formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) {
            return "--:--";
        }
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Function to update the timer display
    function updateTimerDisplay() {
        const totalSecondsPlanned = totalMinutes * 60;
        const remainingSeconds = Math.max(0, totalSecondsPlanned - elapsedSeconds);
        const formattedTime = formatTime(remainingSeconds);
        // Add log before updating
        // console.log(`updateTimerDisplay: elapsed=${elapsedSeconds}, remaining=${remainingSeconds}, formatted=${formattedTime}`);
        timerDisplay.textContent = formattedTime;
    }

    // Function to save tasks to localStorage
    function saveTasks() {
        // Remove optional and skipped from saved data
        const tasksToSave = tasks.map(({ startTime, endTime, completed, skipped, optional, ...rest }) => ({
            ...rest,
            duration: parseInt(rest.duration, 10) || 1,
            isActive: rest.isActive === undefined ? true : rest.isActive
        }));
        localStorage.setItem('routineTasks', JSON.stringify(tasksToSave));

        // Recalculate based on ALL tasks, but filter for main UI later
        totalMinutes = tasks.reduce((sum, task) => sum + (task.isActive ? (task.duration || 0) : 0), 0);
        console.log(`Tasks saved. New total duration for ACTIVE tasks: ${totalMinutes} minutes`);
        initializeUI(); // Re-init main UI
    }

    // Function to initialize the UI (tasks and progress bar)
    function initializeUI() {
        console.log("Initializing UI..."); // Log init start
        activeTasks = tasks.filter(task => task.isActive);
        console.log(`Filtered ${activeTasks.length} active tasks.`); // Log active task count

        taskListElement.innerHTML = '';
        progressBar.innerHTML = '';
        routineRunning = false; // Reset running state on UI init
        if(timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        currentTaskIndex = 0;
        elapsedSeconds = 0;
        currentMinuteMarker = -1;
        startButton.style.display = 'inline-block';
        startButton.disabled = activeTasks.length === 0;
        if (activeTasks.length === 0) {
             startButton.textContent = 'No Active Tasks';
        } else {
             startButton.textContent = 'Start Routine';
        }
        timeMarker.style.display = 'none';
        timeMarker.style.left = '0%';
        timeMarker.style.backgroundColor = 'rgba(51, 51, 51, 0.7)'; // Reset marker color

        // Calculate totalMinutes based ONLY on active tasks
        totalMinutes = activeTasks.reduce((sum, task) => sum + (task.duration || 0), 0);
        console.log(`Initializing UI with ${activeTasks.length} active tasks. Total active duration: ${totalMinutes} minutes`);
        if (totalMinutes === 0) {
            console.warn("No tasks or total duration is zero. Progress bar will be empty.");
        }

        // Reset active task states
        activeTasks.forEach(task => {
            task.completed = false;
            task.skipped = false;
            task.startTime = null;
            task.endTime = null;
        });

        let minuteCounter = 0;
        // Use the filtered activeTasks list for generating UI
        activeTasks.forEach((task, activeIndex) => {
            const listItem = document.createElement('li');
            listItem.classList.add('task-item');
            listItem.dataset.taskIndex = activeIndex;
            listItem.dataset.originalTaskId = task.id;

            // Set CSS Variable for task border color with transparency
            const taskColorObject = availableColors.find(c => c.id === task.colorId);
            let borderColorRgba = 'rgba(204, 204, 204, 0.7)'; // Default fallback: grey at 70% alpha
            let colorName = '[Unknown]';

            if (taskColorObject && taskColorObject.dark) {
                colorName = taskColorObject.name;
                const rgba = hexToRgba(taskColorObject.dark, 0.7); // Apply 70% alpha (30% transparent)
                if (rgba) {
                    borderColorRgba = rgba;
                } else {
                    console.warn(`Failed to convert hex ${taskColorObject.dark} for task '${task.name}'. Using fallback.`);
                    // Fallback already set
                }
            } else {
                console.warn(`Task '${task.name}' (ID: ${task.id}) has invalid or missing colorId: '${task.colorId}' or missing dark color. Using fallback.`);
                colorName = availableColors[0].name + ' (Fallback)';
                // Use first available color as fallback, converting it
                const fallbackRgba = hexToRgba(availableColors[0].dark, 0.7);
                if(fallbackRgba) borderColorRgba = fallbackRgba;
            }
            // Log the color being applied
            // console.log(`Applying border color ${borderColorRgba} (${colorName}) to task '${task.name}'`);
            listItem.style.setProperty('--task-color-border', borderColorRgba);

            // Icon
            const iconSpan = document.createElement('span');
            iconSpan.classList.add('task-icon');
            iconSpan.textContent = task.icon || '❓'; // Use task icon or default
            listItem.appendChild(iconSpan);

            // Details (Label ONLY)
            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('task-details');
            const label = document.createElement('label');
            label.htmlFor = `task-complete-${task.id}`;
            label.textContent = `${task.name}`;
            detailsDiv.appendChild(label);
            listItem.appendChild(detailsDiv);

            // Duration Span (Separate Column)
            const durationSpan = document.createElement('span');
            durationSpan.classList.add('task-duration');
            durationSpan.textContent = `${task.duration} min`; // Just the number and unit
            listItem.appendChild(durationSpan);

            // Controls (Checkbox)
            const controlsDiv = document.createElement('div');
            controlsDiv.classList.add('task-controls');
            const completeCheckbox = document.createElement('input');
            completeCheckbox.type = 'checkbox';
            completeCheckbox.classList.add('complete-checkbox');
            completeCheckbox.id = `task-complete-${task.id}`;
            completeCheckbox.checked = task.completed;
            completeCheckbox.disabled = true;
            controlsDiv.appendChild(completeCheckbox);
            listItem.appendChild(controlsDiv);
            taskListElement.appendChild(listItem);

            // Generate progress bar squares based on active tasks
            let isFirstSquare = true; // Flag for the first square of this task
            for (let i = 0; i < task.duration; i++) {
                if (minuteCounter < totalMinutes) {
                    const square = document.createElement('div');
                    square.classList.add('progress-square');
                    const colorId = task.colorId || availableColors[0].id;
                    square.classList.add(`task-color-${colorId}-light`);
                    square.dataset.minute = minuteCounter;
                    square.dataset.taskId = task.id;
                    square.title = `${task.name} (Planned Minute ${i + 1}/${task.duration})`;

                    // Add icon to the first square of the task
                    if (isFirstSquare) {
                        const iconSpan = document.createElement('span');
                        iconSpan.classList.add('pb-icon');
                        iconSpan.textContent = task.icon || '';
                        square.appendChild(iconSpan);
                        isFirstSquare = false; // Reset flag
                    }

                    progressBar.appendChild(square);
                    minuteCounter++;
                }
            }
        });

        if (minuteCounter !== totalMinutes && totalMinutes > 0) {
             console.warn(`Minute counter ${minuteCounter} doesn\'t match total active minutes ${totalMinutes}.`);
        }
        console.log(`UI Initialized with ${minuteCounter} squares for active tasks.`);
        updateTimerDisplay();

        // Also reset runtime control buttons
        runtimeControls.style.display = 'none';
        pauseResumeButton.textContent = 'Pause';
        pauseResumeButton.classList.remove('paused');
        isPaused = false;
        startButton.style.display = 'inline-block'; // Ensure start button is visible initially
        startButton.disabled = activeTasks.length === 0; // Disable if no active tasks
        if (activeTasks.length === 0) {
             startButton.textContent = 'No Active Tasks';
        }

        updateTimerDisplay(); // Set initial timer display
        console.log(`Start button disabled state: ${startButton.disabled}`);
        console.log(`Start button text: ${startButton.textContent}`);
        console.log("UI Initialization complete.");
    }

    // Function to start the routine timer (or resume)
    function startRoutine() {
        console.log("startRoutine called."); // Log function entry
        console.log(`Current state: routineRunning=${routineRunning}, isPaused=${isPaused}`);

        if (routineRunning && !isPaused) {
             console.warn("StartRoutine blocked: Already running and not paused.");
             return;
        }

        if (!isPaused) { // Starting fresh
            console.log("Attempting to start fresh...");
            initializeUI();
            console.log(`Checking active tasks after re-init: ${activeTasks.length}`);
            if(activeTasks.length === 0) {
                 console.warn("StartRoutine blocked: No active tasks after init.");
                 return;
            }
            routineStartTime = Date.now();
            elapsedSeconds = 0;
            currentTaskIndex = 0;
            console.log('Routine Started Fresh - setting up interval.');
            taskListElement.querySelectorAll('.complete-checkbox').forEach(cb => cb.disabled = false);
            highlightTask(0); // Use highlightTask instead
        } else {
            // Resuming from pause
            // Adjust start time to account for the pause duration
            routineStartTime += (Date.now() - pausedTime);
            isPaused = false;
            console.log('Routine Resumed - setting up interval.');
            // Ensure checkboxes are enabled after resuming
            taskListElement.querySelectorAll('.complete-checkbox').forEach(cb => cb.disabled = false);
            updateHighlightBasedOnTime(); // Update highlight immediately on resume
        }

        routineRunning = true;
        isPaused = false; 
        startButton.style.display = 'none';
        runtimeControls.style.display = 'flex';
        pauseResumeButton.textContent = 'Pause';
        pauseResumeButton.classList.remove('paused');

        timeMarker.style.display = 'block'; 

        updateTimerDisplay();
        updateTimeMarker(); 

        if (timerInterval) clearInterval(timerInterval);
        console.log("Setting timer interval...");
        timerInterval = setInterval(() => {
            // Log interval execution
            console.log(`Interval Tick: routineRunning=${routineRunning}, isPaused=${isPaused}`);

            if (!routineRunning || isPaused) {
                console.log("Interval stopped (routine not running or paused).");
                clearInterval(timerInterval);
                return;
            }
            // Calculate elapsed time based on current time and start time
            const newElapsedSeconds = Math.floor((Date.now() - routineStartTime) / 1000);
            // Log if elapsedSeconds changes
            if (newElapsedSeconds !== elapsedSeconds) {
                 console.log(`Elapsed seconds updated: ${elapsedSeconds} -> ${newElapsedSeconds}`);
                 elapsedSeconds = newElapsedSeconds;
            } else {
                 // Log if no change - might indicate issue with Date.now() or routineStartTime
                 // console.log(`Elapsed seconds unchanged: ${elapsedSeconds}`);
            }

            // Call update functions
            // console.log("Calling update functions from interval...");
            updateTimerDisplay();
            updateTimeMarker();
            updateHighlightBasedOnTime();

            // Check for routine end
            if (totalMinutes > 0 && elapsedSeconds >= totalMinutes * 60) {
                console.log('Total routine time elapsed - ending routine from interval.');
                timerDisplay.textContent = formatTime(0);
                endRoutine();
            }
        }, 1000);
        console.log("startRoutine finished setup, interval started.");
    }

    // Function to Pause the routine
    function pauseRoutine() {
        if (!routineRunning || isPaused) return; // Not running or already paused

        isPaused = true;
        pausedTime = Date.now(); // Record when pause started
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        pauseResumeButton.textContent = 'Resume';
        pauseResumeButton.classList.add('paused');
        // Disable checkboxes when paused
        taskListElement.querySelectorAll('.complete-checkbox').forEach(cb => cb.disabled = true);
        highlightTask(-1); // Remove highlight when paused
        console.log('Routine Paused');
    }

    // Function to Restart the routine
    function restartRoutine() {
         if (!confirm("Are you sure you want to restart the entire routine?")) return;

         console.log('Restarting Routine...');
         if (timerInterval) {
             clearInterval(timerInterval);
             timerInterval = null;
         }
         routineRunning = false;
         isPaused = false;
         elapsedSeconds = 0;
         // Re-initialize UI completely, which resets tasks and timer display
         initializeUI();
         // Hide runtime controls, show start button
         runtimeControls.style.display = 'none';
         startButton.style.display = 'inline-block';
         startButton.textContent = 'Start Routine';
         startButton.disabled = activeTasks.length === 0;
         // initializeUI disables checkboxes initially
          highlightTask(-1); // Remove highlight
    }

    // Function to adjust time
    function adjustTime(deltaSeconds) {
        if (!routineRunning || isPaused) return; // Can only adjust while running

        const newElapsedSeconds = elapsedSeconds + deltaSeconds;
        if (newElapsedSeconds < 0) {
            elapsedSeconds = 0; // Don't go below zero
        } else {
            elapsedSeconds = newElapsedSeconds;
        }

        // Adjust start time to keep interval calculations consistent
        routineStartTime = Date.now() - (elapsedSeconds * 1000);

        // Immediately update displays
        updateTimerDisplay();
        updateTimeMarker();
        console.log(`Time adjusted by ${deltaSeconds}s. New elapsed: ${elapsedSeconds}s`);
    }

    // Updated toggle function name for clarity
    function toggleTaskVisualCompletion(activeIndex, isChecked) {
        if (activeIndex >= activeTasks.length || activeIndex < 0) return; // Invalid index

        const task = activeTasks[activeIndex];
        task.completed = isChecked; // Update data model state

        // Update checkbox appearance directly
        const checkbox = taskListElement.querySelector(`#task-complete-${task.id}`);
        if (checkbox) checkbox.checked = isChecked;
         // Update the task list item appearance (e.g., line-through)
         updateTaskListItemAppearance(activeIndex, isChecked);
        // Update progress bar color for this task
        updateProgressBarForTask(activeIndex);

        console.log(`Task ${activeIndex} visual completion toggled to: ${isChecked}`);
    }

    // NEW function to update ONLY the progress bar color for a specific task
    function updateProgressBarForTask(activeIndex) {
        const task = activeTasks[activeIndex];
        if (!task) return;

        let startMinute = 0;
        for (let i = 0; i < activeIndex; i++) {
            startMinute += activeTasks[i].duration;
        }
        const squares = progressBar.querySelectorAll('.progress-square');
        const plannedDurationMinutes = task.duration;
        const isCompleted = task.completed;
        const colorId = task.colorId || availableColors[0].id;

        // Recolor ALL squares within the task's PLANNED duration
        for (let i = 0; i < plannedDurationMinutes; i++) {
            const minuteIndex = startMinute + i;
            if (minuteIndex < squares.length && squares[minuteIndex]) {
                const square = squares[minuteIndex];
                square.className = 'progress-square'; // Reset classes
                square.dataset.taskId = task.id;
                square.title = `${task.name} (Planned Minute ${i + 1}/${plannedDurationMinutes})`;

                if (isCompleted) {
                    square.classList.add('task-completed'); // Green
                    square.title += ' - Visually Completed';
                } else {
                    square.classList.add(`task-color-${colorId}-light`); // Light task color
                }

                // Ensure icon is only on the first square and correct
                const existingIcon = square.querySelector('.pb-icon');
                if (existingIcon) existingIcon.remove();
                if (i === 0) { // Only add icon to the first square
                    const iconSpan = document.createElement('span');
                    iconSpan.classList.add('pb-icon');
                    iconSpan.textContent = task.icon || '';
                    square.appendChild(iconSpan);
                }
            }
        }
    }

    // Renamed and refocused: This ONLY highlights the task item
    function highlightTask(activeIndexToHighlight) {
         taskListElement.querySelectorAll('.task-item').forEach((item) => {
            const itemIndex = parseInt(item.dataset.taskIndex, 10);
            if (isNaN(itemIndex)) return;

            // Always remove active class first
            item.classList.remove('active'); 

            // Add active class ONLY if it matches the index AND is NOT already completed
            if (itemIndex === activeIndexToHighlight && !item.classList.contains('completed')) {
                 item.classList.add('active');
            }
        });
    }

    // NEW: Separate function to update just the list item style (e.g., line-through)
    function updateTaskListItemAppearance(activeIndex, isCompleted) {
        const taskItem = taskListElement.querySelector(`[data-task-index="${activeIndex}"]`);
        if (!taskItem) return;
         if (isCompleted) {
            taskItem.classList.add('completed');
            taskItem.classList.remove('active'); // Explicitly remove active class on completion
        } else {
            taskItem.classList.remove('completed');
            // If it should be active now (because it's the current index and routine is running and not paused)
            // re-add the active class. highlightTask might handle this too, but be explicit.
             const shouldBeActive = (activeIndex === currentTaskIndex && routineRunning && !isPaused);
             if (shouldBeActive) {
                 taskItem.classList.add('active');
             } else { // Ensure active is removed if not the current active task when uncompleting
                 taskItem.classList.remove('active');
             }
        }
    }

    // Function to move to the next task or end the routine
    function moveToNextTask() {
        // Deactivate current task visually first
        const currentTaskItem = taskListElement.querySelector(`[data-task-index="${currentTaskIndex}"]`);
        if (currentTaskItem) {
             currentTaskItem.classList.remove('active');
             // Ensure controls are disabled
             const completeCheckbox = currentTaskItem.querySelector('.complete-checkbox');
             if (completeCheckbox) completeCheckbox.disabled = true;
        }

        currentTaskIndex++;
        console.log(`Moving to next active task index: ${currentTaskIndex}`);
        if (currentTaskIndex < activeTasks.length) {
            activateTask(currentTaskIndex);
        } else {
            console.log('All active tasks processed, ending routine.');
            endRoutine();
        }
    }

    // Function to end the routine
    function endRoutine() {
        if (!routineRunning) return; // Prevent multiple calls

        console.log('Ending routine...');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            console.log('Timer interval cleared.');
        }
        routineRunning = false;
        isPaused = false;
        startButton.style.display = 'inline-block'; // Show Start button again
        startButton.textContent = 'Routine Complete! 🎉';
        startButton.disabled = true; // Keep disabled unless restarted
        runtimeControls.style.display = 'none'; // Hide runtime controls
        timeMarker.style.backgroundColor = '#4CAF50'; // Green marker for completion

        // Disable all remaining inputs/buttons
        taskListElement.querySelectorAll('input[type="checkbox"]').forEach(el => el.disabled = true);

        // Ensure the last task (Dad time) is marked visually if routine finishes naturally
        if (currentTaskIndex >= activeTasks.length -1 && !activeTasks[activeTasks.length - 1].completed) {
             console.log('Marking final task as completed visually.');
             activeTasks[activeTasks.length - 1].completed = true; // Mark data model
             updateTaskAppearance(activeTasks.length - 1, true);
        }

        console.log('Routine Ended Fully.');
    }

    // Function to update the time marker position
    function updateTimeMarker() {
         const elapsedMinutes = Math.floor(elapsedSeconds / 60);

         // Remove the condition that prevents backward movement
         // Always calculate and set the position when this function is called
         
         // Update the internal minute tracker (still useful for potential optimizations later)
         currentMinuteMarker = elapsedMinutes;

         // Calculate position as a percentage of DYNAMIC totalMinutes
         const percentage = (totalMinutes > 0) ? Math.min(100, (currentMinuteMarker / totalMinutes) * 100) : 0;
         timeMarker.style.left = `${percentage}%`;
         // console.log(`Time marker update: ${elapsedSeconds}s (${currentMinuteMarker}m / ${totalMinutes}m) -> ${percentage}%`);

         // Remove the initial position setting logic as it's now handled above
         /* else if (elapsedSeconds === 0 && currentMinuteMarker === -1) {
             currentMinuteMarker = 0;
             timeMarker.style.left = `0%`;
             console.log(`Time marker initial position set at 0%`);
         }*/
    }

    // NEW function to determine which task *should* be active based on time
    function updateHighlightBasedOnTime() {
        if (!routineRunning || isPaused) return;

        let cumulativeDuration = 0;
        let activeIndexFound = -1;

        for (let i = 0; i < activeTasks.length; i++) {
            cumulativeDuration += activeTasks[i].duration;
            // If elapsed time (in minutes) is less than the cumulative duration of this task
            // then this task should be the highlighted one.
            if (elapsedSeconds / 60 < cumulativeDuration) {
                activeIndexFound = i;
                break;
            }
        }
         // If time exceeds all task durations, maybe highlight last or none?
         if (activeIndexFound === -1 && elapsedSeconds / 60 >= totalMinutes) {
             activeIndexFound = activeTasks.length - 1; // Highlight last task when done?
         }

        // Highlight the found task (or remove highlight if none found?)
        highlightTask(activeIndexFound); 
    }

    // Event listeners
    startButton.addEventListener('click', () => {
        console.log("Start button clicked!"); // Log click
        startRoutine();
    });

    // Runtime Control Listeners
    pauseResumeButton.addEventListener('click', () => {
        if (isPaused) {
            startRoutine(); // This will act as resume
        } else {
            pauseRoutine();
        }
    });
    restartButton.addEventListener('click', restartRoutine);
    adjustTimeMinusButton.addEventListener('click', () => adjustTime(-60)); // -1 minute
    adjustTimePlusButton.addEventListener('click', () => adjustTime(60)); // +1 minute

    // Change listener for checkboxes (Simplified)
    taskListElement.addEventListener('change', (event) => {
        const target = event.target;
        if (!target.classList.contains('complete-checkbox') || !routineRunning || isPaused) return; // Ignore if paused

        const taskItem = target.closest('.task-item');
        if (!taskItem) return;

        const activeIndex = parseInt(taskItem.dataset.taskIndex, 10);
        if (isNaN(activeIndex)) return;

        // Directly call the toggle function
        toggleTaskVisualCompletion(activeIndex, target.checked);
    });

    // --- Settings Modal Logic ---

    function updateSettingsTotal() {
        const currentTotal = tasks.reduce((sum, task) => sum + (task.isActive ? (parseInt(task.duration, 10) || 0) : 0), 0);
        if (settingsTotalMinutes) {
            settingsTotalMinutes.textContent = currentTotal;
        }
    }

    function populateSettings() {
        settingsTaskList.innerHTML = '';
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('setting-task-item', 'settings-header');
        // Remove Optional header
        headerDiv.innerHTML = `
            <span class="drag-handle"></span>
            <div class="setting-inputs header-inputs">
                <span class="setting-icon header-label">Icon</span>
                <span class="setting-name header-label">Task Name</span>
                <span class="setting-duration header-label">Mins</span>
                <span class="setting-color header-label">Color</span>
                 <!-- <span class="setting-optional header-label">Optional</span> -->
            </div>
            <span class="setting-active header-label">Active</span>
            <div class="setting-buttons header-buttons">
                <span class="header-label">Actions</span>
            </div>
        `;
        settingsTaskList.appendChild(headerDiv);

        if (tasks.length === 0) {
             settingsTaskList.appendChild(document.createTextNode('No tasks defined. Add one below!'));
        }

        tasks.forEach((task, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('setting-task-item');
            itemDiv.dataset.taskId = task.id;
            itemDiv.draggable = true; // Make item draggable

            // Drag Handle
            const handle = document.createElement('span');
            handle.classList.add('drag-handle');
            handle.textContent = '☰';
            itemDiv.appendChild(handle);

            // --- Inputs --- (Icon, Name, Duration, Color, Optional)
            const inputsDiv = document.createElement('div');
            inputsDiv.classList.add('setting-inputs');

            // Icon Select
            const iconSelect = document.createElement('select');
            iconSelect.classList.add('setting-icon');
            iconSelect.dataset.field = 'icon';
            availableIcons.forEach(icon => {
                const option = document.createElement('option');
                option.value = icon;
                option.textContent = icon;
                if (task.icon === icon) {
                    option.selected = true;
                }
                iconSelect.appendChild(option);
            });
            inputsDiv.appendChild(iconSelect);

            // Name Input
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = task.name;
            nameInput.placeholder = 'Task Name';
            nameInput.classList.add('setting-name');
            nameInput.dataset.field = 'name';
            inputsDiv.appendChild(nameInput);

            // Duration Input
            const durationInput = document.createElement('input');
            durationInput.type = 'number';
            durationInput.value = task.duration;
            durationInput.min = 1;
            durationInput.placeholder = 'Mins';
            durationInput.classList.add('setting-duration');
            durationInput.dataset.field = 'duration';
            inputsDiv.appendChild(durationInput);

            // Color Select
            const colorSelect = document.createElement('select');
            colorSelect.classList.add('setting-color');
            colorSelect.dataset.field = 'colorId';
            availableColors.forEach(color => {
                const option = document.createElement('option');
                option.value = color.id;
                option.textContent = color.name;
                 option.style.backgroundColor = color.light; // Show color in dropdown
                if (task.colorId === color.id) {
                    option.selected = true;
                }
                colorSelect.appendChild(option);
            });
            inputsDiv.appendChild(colorSelect);

            // Set initial background color for the color select
            const initialColor = availableColors.find(c => c.id === task.colorId);
            if (initialColor) {
                colorSelect.style.backgroundColor = initialColor.light;
                colorSelect.style.color = isLight(initialColor.light) ? '#000' : '#fff';
            }

            itemDiv.appendChild(inputsDiv);

            // --- Active Checkbox (Separate Column after Inputs) ---
            const activeCheckbox = document.createElement('input');
            activeCheckbox.type = 'checkbox';
            activeCheckbox.checked = task.isActive === undefined ? true : task.isActive;
            activeCheckbox.dataset.field = 'isActive';
            activeCheckbox.classList.add('setting-active-cb');
            itemDiv.appendChild(activeCheckbox);

            // --- Buttons (Delete ONLY) ---
            const buttonsDiv = document.createElement('div');
            buttonsDiv.classList.add('setting-buttons');

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '🗑️';
            deleteButton.title = 'Delete Task';
            deleteButton.classList.add('delete-button');
            buttonsDiv.appendChild(deleteButton);

            itemDiv.appendChild(buttonsDiv);

            settingsTaskList.appendChild(itemDiv);
        });
        updateSettingsTotal(); // Update total display
        console.log("Settings populated (no optional)");
    }

    // Add New Task Button Listener
    addNewTaskButton.addEventListener('click', () => {
        const newId = Date.now(); // Simple unique ID
        const newTask = {
            id: newId,
            name: 'New Task',
            duration: 5,
            icon: '✨',
            colorId: availableColors[0].id, // Default color
            isActive: true, // Default isActive to true if missing
            // Reset runtime properties
            completed: false,
            skipped: false,
            startTime: null,
            endTime: null
        };
        tasks.push(newTask);
        populateSettings(); // Refresh settings view
        console.log("Added new task:", newTask);
    });

    // Event Delegation for Settings List Controls (Delete ONLY now)
    settingsTaskList.addEventListener('click', (event) => {
        const target = event.target;
        const taskItem = target.closest('.setting-task-item');
        if (!taskItem) return;

        const taskId = parseInt(taskItem.dataset.taskId, 10);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        // Delete Button
        if (target.classList.contains('delete-button')) {
            if (confirm(`Are you sure you want to delete task "${tasks[taskIndex].name}"?`)) {
                tasks.splice(taskIndex, 1);
                populateSettings(); // Refresh view
                console.log(`Deleted task with ID: ${taskId}`);
            }
        }
    });

    // Event Delegation for Input Changes in Settings (No change needed here)
    settingsTaskList.addEventListener('input', (event) => {
        const target = event.target;
        const taskItem = target.closest('.setting-task-item');
        if (!taskItem || !target.dataset.field) return;

        const taskId = parseInt(taskItem.dataset.taskId, 10);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const field = target.dataset.field;
        let value;

        if (target.type === 'checkbox') { // Only Active checkbox remains
             value = target.checked;
         } else if (target.tagName === 'SELECT') {
             value = target.value;
         } else if (target.type === 'number') {
             value = parseInt(target.value, 10) || 1;
             if (value < 1) value = 1;
             target.value = value;
         } else { // Text input (name)
             value = target.value;
         }

        // Update task data if changed
        if (tasks[taskIndex][field] !== value) {
            tasks[taskIndex][field] = value;
            console.log(`Updated task ${taskId} field ${field} to ${value}`);
            if (field === 'duration' || field === 'isActive') {
                updateSettingsTotal();
            }
             // Update color preview
            if (field === 'colorId' && target.tagName === 'SELECT') {
                const selectedColor = availableColors.find(c => c.id === value);
                if (selectedColor) {
                    target.style.backgroundColor = selectedColor.light;
                    target.style.color = isLight(selectedColor.light) ? '#000' : '#fff';
                }
            }
        }
    });

    // Show/Hide Modal listeners (already added)
    settingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        populateSettings(); // Populate when opened
    });

    closeSettingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
        saveTasks(); // Save changes and re-init main UI when closed
    });

    window.addEventListener('click', (event) => {
        if (event.target == settingsModal) {
            settingsModal.style.display = 'none';
            saveTasks(); // Save changes and re-init main UI when closed
        }
    });

    // Helper function to determine text color based on background lightness
    function isLight(hexColor) {
        if (!hexColor || hexColor.length < 7) return true; // Default to dark text
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        // Formula for perceived brightness (YIQ)
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return brightness > 150; // Threshold can be adjusted
    }

    // --- Drag and Drop Logic ---
    let draggedTaskId = null;

    settingsTaskList.addEventListener('dragstart', (event) => {
        const taskItem = event.target.closest('.setting-task-item');
        if (!taskItem) return;

        draggedTaskId = parseInt(taskItem.dataset.taskId, 10);
        event.dataTransfer.setData('text/plain', draggedTaskId.toString());
        event.dataTransfer.effectAllowed = 'move';
        
        // Add slight delay so browser can render drag image before style changes
        setTimeout(() => {
            taskItem.classList.add('dragging');
        }, 0);
        console.log(`Drag Start: ${draggedTaskId}`);
    });

    settingsTaskList.addEventListener('dragend', (event) => {
        const taskItem = event.target.closest('.setting-task-item');
         if (taskItem) { // Ensure it's the original item
             taskItem.classList.remove('dragging');
         }
         // Clean up any lingering drag-over styles
         settingsTaskList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        draggedTaskId = null;
        console.log("Drag End");
    });

    settingsTaskList.addEventListener('dragover', (event) => {
        event.preventDefault(); // Necessary to allow drop
        event.dataTransfer.dropEffect = 'move';

        const targetItem = event.target.closest('.setting-task-item');
        if (!targetItem || parseInt(targetItem.dataset.taskId, 10) === draggedTaskId) {
             // Don't allow dropping on itself or outside items
             settingsTaskList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
             return;
         }

         // Basic visual indicator - add class to target
         // Remove from others first for cleaner visual
         settingsTaskList.querySelectorAll('.drag-over').forEach(el => {
             if (el !== targetItem) el.classList.remove('drag-over');
         });
        targetItem.classList.add('drag-over');
    });

    settingsTaskList.addEventListener('dragleave', (event) => {
         const targetItem = event.target.closest('.setting-task-item');
         if (targetItem) {
             targetItem.classList.remove('drag-over');
         }
    });

    settingsTaskList.addEventListener('drop', (event) => {
        event.preventDefault();
        const targetItem = event.target.closest('.setting-task-item');
        if (!targetItem) {
             console.log("Drop occurred outside a valid target item.");
             if (draggedTaskId !== null) { // Clean up dragging state if dropped outside
                const draggedElement = settingsTaskList.querySelector(`.setting-task-item[data-task-id='${draggedTaskId}'] .dragging`);
                if(draggedElement) draggedElement.classList.remove('dragging');
             }
             settingsTaskList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
             draggedTaskId = null;
            return;
         }

        const targetTaskId = parseInt(targetItem.dataset.taskId, 10);
        targetItem.classList.remove('drag-over'); // Remove drop indicator

        if (draggedTaskId === null || draggedTaskId === targetTaskId) {
            console.log("Drop cancelled (same item or no dragged item).");
            draggedTaskId = null;
            return;
        }

        console.log(`Drop: Dragged ${draggedTaskId} onto ${targetTaskId}`);

        // Find original indices
        const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
        const targetIndex = tasks.findIndex(t => t.id === targetTaskId);

        if (draggedIndex === -1 || targetIndex === -1) {
            console.error("Could not find dragged or target task in array!");
            draggedTaskId = null;
            return;
        }

        // Reorder the array
        const [draggedTask] = tasks.splice(draggedIndex, 1); // Remove dragged item
        // Calculate new target index *after* removal
        const newTargetIndex = tasks.findIndex(t => t.id === targetTaskId);
        tasks.splice(newTargetIndex, 0, draggedTask); // Insert before target

        console.log("Tasks array reordered.");
        populateSettings(); // Re-render the settings list

        draggedTaskId = null; // Reset dragged item
    });

    // Initial setup
    initializeUI(); // Load tasks from storage (implicitly done by `tasks` definition) and draw main UI
}); 