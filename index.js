const tf = require('@tensorflow/tfjs');
const pool = require('./database');
// Datos de ejemplo
const data = [
    { usaQi: 50, co2: 400, co: 0.4, humidity: 60, pm25: 20, pm10: 30, pm100: 40, temperature: 25 },
    { usaQi: 55, co2: 420, co: 0.42, humidity: 65, pm25: 22, pm10: 32, pm100: 42, temperature: 26 },
    { usaQi: 60, co2: 430, co: 0.43, humidity: 70, pm25: 23, pm10: 33, pm100: 43, temperature: 27 },
    { usaQi: 65, co2: 440, co: 0.44, humidity: 75, pm25: 24, pm10: 34, pm100: 44, temperature: 28 },
    { usaQi: 70, co2: 450, co: 0.45, humidity: 80, pm25: 25, pm10: 35, pm100: 45, temperature: 29 },
    { usaQi: 45, co2: 380, co: 0.38, humidity: 55, pm25: 18, pm10: 28, pm100: 38, temperature: 24 },
    { usaQi: 80, co2: 470, co: 0.47, humidity: 85, pm25: 27, pm10: 37, pm100: 47, temperature: 31 },
    { usaQi: 52, co2: 410, co: 0.41, humidity: 62, pm25: 21, pm10: 31, pm100: 41, temperature: 25.5 },
    { usaQi: 68, co2: 445, co: 0.445, humidity: 78, pm25: 24.5, pm10: 34.5, pm100: 44.5, temperature: 28.5 },
    { usaQi: 58, co2: 425, co: 0.425, humidity: 68, pm25: 22.5, pm10: 32.5, pm100: 42.5, temperature: 26.5 },
    { usaQi: 72, co2: 455, co: 0.455, humidity: 82, pm25: 25.5, pm10: 35.5, pm100: 45.5, temperature: 29.5 },
    { usaQi: 42, co2: 370, co: 0.37, humidity: 52, pm25: 17, pm10: 27, pm100: 37, temperature: 23 },
    { usaQi: 85, co2: 480, co: 0.48, humidity: 88, pm25: 28, pm10: 38, pm100: 48, temperature: 32 },
    { usaQi: 49, co2: 395, co: 0.395, humidity: 59, pm25: 19.5, pm10: 29.5, pm100: 39.5, temperature: 24.5 },
    { usaQi: 63, co2: 435, co: 0.435, humidity: 72, pm25: 23.5, pm10: 33.5, pm100: 43.5, temperature: 27.5 },
    { usaQi: 53, co2: 415, co: 0.415, humidity: 64, pm25: 21.5, pm10: 31.5, pm100: 41.5, temperature: 25.7 },
    { usaQi: 74, co2: 465, co: 0.465, humidity: 84, pm25: 26.5, pm10: 36.5, pm100: 46.5, temperature: 30.5 },
    { usaQi: 40, co2: 360, co: 0.36, humidity: 50, pm25: 16, pm10: 26, pm100: 36, temperature: 22 },
    { usaQi: 90, co2: 490, co: 0.49, humidity: 90, pm25: 29, pm10: 39, pm100: 49, temperature: 33 },
    { usaQi: 47, co2: 385, co: 0.385, humidity: 57, pm25: 18.5, pm10: 28.5, pm100: 38.5, temperature: 23.5 },
    { usaQi: 67, co2: 443, co: 0.443, humidity: 76, pm25: 24.3, pm10: 34.3, pm100: 44.3, temperature: 28.3 },
    { usaQi: 56, co2: 422, co: 0.422, humidity: 66, pm25: 22.2, pm10: 32.2, pm100: 42.2, temperature: 26.2 },
    { usaQi: 78, co2: 475, co: 0.475, humidity: 86, pm25: 27.5, pm10: 37.5, pm100: 47.5, temperature: 31.5 },
    { usaQi: 38, co2: 350, co: 0.35, humidity: 48, pm25: 15, pm10: 25, pm100: 35, temperature: 21 }
  ];

  function augmentData(data) {
    const augmentedData = [];
    const noiseFactor = 0.1; 
  
    for (const sample of data) {
      augmentedData.push(sample); 
      const noisySample = { ...sample };
      for (const feature of ["co2", "co", "humidity", "pm25", "pm10", "pm100", "temperature"]) {
        noisySample[feature] = Math.max(0, noisySample[feature] + (Math.random() - 0.5) * 2 * noiseFactor * sample[feature]); 
      }
      augmentedData.push(noisySample);
    }
    return augmentedData;
  }
  

function preprocessData(data) {
  const xs = data.map(d => [d.co2, d.co, d.humidity, d.pm25, d.pm10, d.pm100, d.temperature]);
  const ys = data.map(d => d.usaQi);

  let xsTensor = tf.tensor2d(xs);
  let ysTensor = tf.tensor2d(ys, [ys.length, 1]);

  const xsMin = xsTensor.min(0);
  const xsMax = xsTensor.max(0);
  xsTensor = xsTensor.sub(xsMin).div(xsMax.sub(xsMin));

  return [xsTensor, ysTensor, xsMin, xsMax]; 
}

function createModel() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [7], units: 20, activation: 'relu' })); 
  model.add(tf.layers.dense({ units: 10, activation: 'relu' })); 
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
  return model;
}

async function trainModel(model, xs, ys) {
  await model.fit(xs, ys, {
    epochs: 10000,
    validationSplit: 0.2, 
    callbacks: tf.callbacks.earlyStopping({ patience: 10 }),
  });
}

async function getLastRecord() {
  try {
    const lastRecord = await pool.query("SELECT fecha, hora FROM pruebas ORDER BY fecha DESC, hora DESC LIMIT 1");
    return lastRecord;
  } catch (err) {
    console.error("Error al obtener el último registro:", err);
    return null; // Manejo de errores en la consulta
  }
}

async function main() {
  const augmentedData = augmentData(data);
  const [xs, ys, xsMin, xsMax] = preprocessData(augmentedData);

  const numTrainingSamples = Math.floor(0.8 * augmentedData.length);
  const xsTrain = xs.slice([0, 0], [numTrainingSamples, 7]);
  const ysTrain = ys.slice([0, 0], [numTrainingSamples, 1]);
  const xsTest = xs.slice([numTrainingSamples, 0], [augmentedData.length - numTrainingSamples, 7]);
  const ysTest = ys.slice([numTrainingSamples, 0], [augmentedData.length - numTrainingSamples, 1]);

  const model = createModel();
  await trainModel(model, xsTrain, ysTrain);

  const evaluation = model.evaluate(xsTest, ysTest);
  if (evaluation && evaluation.length === 2) {
    console.log("Evaluation Results:");
    console.log("  Loss (MSE):", evaluation[0].dataSync());
  } else {
    console.error("Evaluation failed. Check your model and data.");
  }

  const predictions = model.predict(xsTest);
  const inputValues = await xsTest.data();
  const predictionValues = await predictions.data();

  const featureNames = ["co2", "co", "humidity", "pm25", "pm10", "pm100", "temperature"];

  // Obtener la última fecha y hora registradas en la base de datos (fuera de los .then)
  const lastRecord = await getLastRecord();
  let currentDate;
  let currentHour; 

  if (lastRecord && lastRecord.rows.length > 0) {
    currentDate = new Date(lastRecord.rows[0].fecha);
    currentHour = parseInt(lastRecord.rows[0].hora.split(':')[0]);
    currentHour++;
  } else {
    currentDate = new Date('2024-05-01'); // Fecha de inicio predeterminada
    currentHour = 0; // Hora de inicio predeterminada
  }

  // Insertar predicciones en la base de datos PostgreSQL (de forma asíncrona)
  for (let i = 0; i < predictionValues.length; i++) {
    const inputFeatures = inputValues.slice(i * 7, i * 7 + 7);
    const usaqi = predictionValues[i].toFixed(2);

    try {
      if (!isNaN(usaqi) && usaqi > 0) {
        // Formatear la fecha y hora
        const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const formattedHour = `${currentHour.toString().padStart(2, '0')}:00:00`; // HH:MM:SS

        // Desnormalizar las características de entrada
        const denormalizedFeatures = inputFeatures.map((feature, index) => (
          feature * (xsMax.dataSync()[index] - xsMin.dataSync()[index]) + xsMin.dataSync()[index]
        ));

        // Espera a que la consulta se complete antes de continuar
        const res = await pool.query(
          "INSERT INTO pruebas (usaqi, co2, co, humidity, pm25, pm10, pm100, temperature, fecha, hora) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [usaqi, ...denormalizedFeatures, formattedDate, formattedHour]
        );

        if (res.rowCount === 1) {
          console.log("Predicción insertada correctamente");
        } else {
          console.warn("La inserción no se realizó correctamente");
        }

        // Calcular outputLine dentro del bucle for
        const outputLine = featureNames.reduce((acc, name, index) => {
          return acc + `${name}: ${denormalizedFeatures[index].toFixed(2)} | `;
        }, "");
        console.log(`usaqi: ${predictionValues[i].toFixed(2)} | ${outputLine}fecha: ${formattedDate} | hora: ${formattedHour}`);
      } else {
        console.warn("Predicción no válida:", usaqi);
      }
    } catch (err) {
      console.error("Error al insertar predicción:", err);
    }

    // Incrementar la hora y el día si es necesario
    currentHour++;
    if (currentHour === 24) {
      currentHour = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } // Fin del bucle for

  // Cerrar el pool de conexiones después de insertar todas las predicciones
  await pool.end();
};

main();