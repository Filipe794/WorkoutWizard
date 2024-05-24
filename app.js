document.addEventListener('DOMContentLoaded', function () {
    const newDivisionButton = document.getElementById('new-division-button');
    const divisionList = document.getElementById('division-list');
    const daysContainer = document.getElementById('days-container');
    const divisionTitle = document.getElementById('division-title');
    const newDayButton = document.getElementById('new-day-button');
    const dayList = document.getElementById('day-list');
    const backButton = document.getElementById('back-button');

    let currentDivision = null;
    let divisions = JSON.parse(localStorage.getItem('divisions')) || {};

    newDivisionButton.addEventListener('click', function () {
        const divisionName = prompt('Nome da nova divisão de treino:');
        if (divisionName) {
            addDivision(divisionName);
            saveDivisions();
        }
    });

    backButton.addEventListener('click', function () {
        showDivisions();
    });

    newDayButton.addEventListener('click', function () {
        const dayName = prompt('Nome do novo dia de treino:');
        if (dayName) {
            addDay(dayName);
            saveDays();
        }
    });

    function addDivision(name) {
        const li = document.createElement('li');
        const h2 = document.createElement('h2');
        h2.textContent = name;
        li.appendChild(h2);

        const manageButton = document.createElement('button');
        manageButton.textContent = 'Gerenciar';
        manageButton.addEventListener('click', function () {
            showDays(name);
        });
        li.appendChild(manageButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remover';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function () {
            delete divisions[name];
            li.remove();
            saveDivisions();
            showMessage('Divisão removida com sucesso.', 'success');
        });
        li.appendChild(deleteButton);

        divisionList.appendChild(li);

        if (!divisions[name]) {
            divisions[name] = {};
        }
    }

    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.classList.add('message', type);
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    function showDays(divisionName) {
        currentDivision = divisionName;
        divisionTitle.textContent = divisionName;
        divisionList.classList.add('hidden');
        daysContainer.classList.remove('hidden');
        loadDays();
    }

    function showDivisions() {
        currentDivision = null;
        divisionTitle.textContent = '';
        daysContainer.classList.add('hidden');
        divisionList.classList.remove('hidden');
    }

    function addDay(name, exercises = []) {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = name;
        li.appendChild(span);

        const exerciseButton = document.createElement('button');
        exerciseButton.textContent = 'Adicionar Exercício';
        exerciseButton.addEventListener('click', function () {
            addExercise(li, name);
        });
        li.appendChild(exerciseButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remover';
        deleteButton.addEventListener('click', function () {
            const index = divisions[currentDivision].days.indexOf(name);
            if (index !== -1) {
                divisions[currentDivision].days.splice(index, 1);
            }
            delete divisions[currentDivision][name];
            li.remove();
            saveDays();
        });
        li.appendChild(deleteButton);

        const reorderButton = document.createElement('button');
        reorderButton.textContent = 'Reordenar Exercícios';
        reorderButton.addEventListener('click', function () {
            reorderExercises(li, name);
        });
        li.appendChild(reorderButton);

        const clearDataButton = document.createElement('button');
        clearDataButton.textContent = 'Limpar Todos os Dados';
        clearDataButton.addEventListener('click', function () {
            clearAllData();
        });
        li.appendChild(clearDataButton);

        dayList.appendChild(li);

        exercises.forEach(exercise => {
            const exerciseElement = createExerciseElement(exercise, name);
            li.appendChild(exerciseElement);
        });

        if (!divisions[currentDivision].days) {
            divisions[currentDivision].days = [];
        }
        if (!divisions[currentDivision].days.includes(name)) {
            divisions[currentDivision].days.push(name);
        }
        if (!divisions[currentDivision][name]) {
            divisions[currentDivision][name] = [];
        }
        saveDays();
    }
    function createExerciseElement(exercise) {
        const exerciseElement = document.createElement('div');
        exerciseElement.innerHTML = `
        <span>Exercício: ${exercise.name}</span>
        <span>Séries: ${exercise.series}</span>
        <span>Repetições: ${exercise.repetitions}</span>
        <span>Peso: ${exercise.weight}</span>
        <button class="remove-exercise">Remover</button>
    `;
        exerciseElement.querySelector('.remove-exercise').addEventListener('click', function () {
            const parent = exerciseElement.parentElement;
            const dayName = parent.querySelector('span').textContent;
            const index = divisions[currentDivision][dayName].indexOf(exercise);
            if (index !== -1) {
                divisions[currentDivision][dayName].splice(index, 1);
            }
            exerciseElement.remove();
            saveDays();
        });
        return exerciseElement;
    }

    function addExercise(dayElement, dayName) {
        const exerciseName = prompt('Nome do exercício:');
        const series = prompt('Quantidade de séries:');
        const repetitions = prompt('Quantidade de repetições:');
        const weight = prompt('Peso utilizado (kg ou placas):');

        if (exerciseName && series && repetitions && weight) {
            const exercise = { name: exerciseName, series, repetitions, weight };
            const exerciseElement = createExerciseElement(exercise, dayName);
            dayElement.appendChild(exerciseElement);

            if (!divisions[currentDivision][dayName]) {
                divisions[currentDivision][dayName] = [];
            }
            divisions[currentDivision][dayName].push(exercise);
            saveDays();
        }
    }

    function saveDivisions() {
        localStorage.setItem('divisions', JSON.stringify(divisions));
    }

    function saveDays() {
        saveDivisions();
    }

    function loadDays() {
        dayList.innerHTML = '';
        const days = divisions[currentDivision].days || [];
        days.forEach(day => addDay(day, divisions[currentDivision][day]));
    }

    function loadDivisions() {
        divisionList.innerHTML = '';
        for (const division in divisions) {
            addDivision(division);
        }
    }

    function editExercise(exerciseElement, dayName) {
        const exerciseName = prompt('Nome do exercício:', exerciseElement.querySelector('span:nth-child(1)').textContent.replace('Exercício: ', ''));
        const series = prompt('Quantidade de séries:', exerciseElement.querySelector('span:nth-child(2)').textContent.replace('Séries: ', ''));
        const repetitions = prompt('Quantidade de repetições:', exerciseElement.querySelector('span:nth-child(3)').textContent.replace('Repetições: ', ''));
        const weight = prompt('Peso utilizado (kg ou placas):', exerciseElement.querySelector('span:nth-child(4)').textContent.replace('Peso: ', ''));

        if (exerciseName && series && repetitions && weight) {
            const index = divisions[currentDivision][dayName].indexOf(exerciseElement.exercise);
            if (index !== -1) {
                divisions[currentDivision][dayName][index] = { name: exerciseName, series, repetitions, weight };
                exerciseElement.querySelector('span:nth-child(1)').textContent = `Exercício: ${exerciseName}`;
                exerciseElement.querySelector('span:nth-child(2)').textContent = `Séries: ${series}`;
                exerciseElement.querySelector('span:nth-child(3)').textContent = `Repetições: ${repetitions}`;
                exerciseElement.querySelector('span:nth-child(4)').textContent = `Peso: ${weight}`;
                saveDays();
            }
        }
    }

    newDayButton.addEventListener('click', function () {
        const dayName = prompt('Nome do novo dia de treino:');
        if (dayName) {
            addDay(dayName);
            saveDays();
        }
    });

    // Adiciona um novo exercício a um dia específico
    function addExercise(dayElement, dayName) {
        const exerciseName = prompt('Nome do exercício:');
        const series = prompt('Quantidade de séries:');
        const repetitions = prompt('Quantidade de repetições:');
        const weight = prompt('Peso utilizado (kg ou placas):');

        if (exerciseName && series && repetitions && weight) {
            const exercise = { name: exerciseName, series, repetitions, weight };
            const exerciseElement = createExerciseElement(exercise, dayName);
            dayElement.appendChild(exerciseElement);

            if (!divisions[currentDivision][dayName]) {
                divisions[currentDivision][dayName] = [];
            }
            divisions[currentDivision][dayName].push(exercise);
            saveDays();
        }
    }

    // Remove um exercício de um dia específico
    function removeExercise(exerciseElement, dayName) {
        const exerciseIndex = divisions[currentDivision][dayName].indexOf(exerciseElement.exercise);
        if (exerciseIndex !== -1) {
            divisions[currentDivision][dayName].splice(exerciseIndex, 1);
            exerciseElement.remove();
            saveDays();
        }
    }

    function createExerciseElement(exercise, dayName) {
        const exerciseElement = document.createElement('div');
        exerciseElement.innerHTML = `
      <span>Exercício: ${exercise.name}</span>
      <span>Séries: ${exercise.series}</span>
      <span>Repetições: ${exercise.repetitions}</span>
      <span>Peso: ${exercise.weight}</span>
      <button class="remove-exercise">Remover</button>
      <button class="edit-exercise">Editar</button>
    `;
        exerciseElement.exercise = exercise;
        exerciseElement.querySelector('.remove-exercise').addEventListener('click', function () {
            const parent = exerciseElement.parentElement;
            const index = divisions[currentDivision][dayName].indexOf(exercise);
            if (index !== -1) {
                divisions[currentDivision][dayName].splice(index, 1);
            }
            exerciseElement.remove();
            saveDays();
        });
        exerciseElement.querySelector('.edit-exercise').addEventListener('click', function () {
            editExercise(exerciseElement, dayName);
        });
        return exerciseElement;
    }

    loadDivisions();
});

