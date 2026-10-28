import { COLORS, createColorExample } from './colorData.js';

const TRAINING_EXAMPLES_PER_COLOR = 40;
const TRAINING_OPTIONS = { epochs: 40, batchSize: 12 };

function createTrainingExamples() {
    return COLORS.flatMap((color) =>
        Array.from({ length: TRAINING_EXAMPLES_PER_COLOR }, () =>
            createColorExample(color),
        ),
    );
}

export default class ML {
    // Create labeled RGB examples, train the ml5 model, and report progress.
    async trainModel(updateProgress) {
    
    updateProgress('Preparing machine learning backend...');

    await ml5.setBackend('webgl');

    updateProgress('Creating training examples...');

    const examples = createTrainingExamples();

    this.model = ml5.neuralNetwork({
        inputs: ['red', 'green', 'blue'],
        outputs: ['label'],
        task: 'classification',
        debug: false,
    });

    for (const example of examples) {
        this.model.addData(
            {
                red: example.red,
                green: example.green,
                blue: example.blue,
            },
            {
                label: example.label,
            },
        );
    }

    updateProgress(
        `Added ${examples.length} labeled examples. Normalizing data...`,
    );

    this.model.normalizeData();

    updateProgress('Training model...');

    await new Promise((resolve, reject) => {
        try {
            this.model.train(TRAINING_OPTIONS, () => {
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });

    updateProgress('Training complete.');
}

    // Classify an RGB color with the trained model and return its label.
    async classify(color) {
    if (!this.model) {
        throw new Error('The model has not been trained yet.');
    }

    const inputs = {
        red: color.red,
        green: color.green,
        blue: color.blue,
    };

    const results = await this.model.classify(inputs);

    if (!results || results.length === 0) {
        throw new Error('The model returned no classification.');
    }

    return results[0].label.toLowerCase();
}
}
