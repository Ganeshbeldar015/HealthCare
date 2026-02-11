import Papa from "papaparse";
import dataset from "../data/medicine_dataset.csv?raw";

/* ================= LOAD DATASET ================= */

let medicineDB = [];

Papa.parse(dataset, {
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    medicineDB = results.data.map((row) => ({
      name: row.Name?.toLowerCase().trim(),
      category: row.Category || "General",
      indication: row.Indication || "",
      classification: row.Classification || "",
    }));
    console.log("Medicine dataset loaded:", medicineDB.length);
  },
});

/* ================= FIND MEDICINE ================= */

function findMedicine(medicineName) {
  const clean = medicineName.toLowerCase().trim();
  return medicineDB.find((m) => clean.includes(m.name));
}

/* ================= DOSAGE FREQUENCY ================= */

function getFrequency(timing) {
  let count = 0;
  if (timing?.morning) count++;
  if (timing?.afternoon) count++;
  if (timing?.night) count++;
  return count || 1;
}

/* ================= RISK ESTIMATION ================= */

function riskLevel(category) {
  const c = category.toLowerCase();

  if (c.includes("antibiotic")) return 3;
  if (c.includes("steroid")) return 3;
  if (c.includes("antidiabetic")) return 2;
  if (c.includes("pain")) return 2;
  if (c.includes("vitamin")) return 1;

  return 2;
}

/* ================= MAIN ANALYSIS ENGINE ================= */

export function analyzePrescription(age, medicines) {
  const durationChart = [];
  const dosageChart = [];
  const riskChart = [];
  const usageCounter = {};

  medicines.forEach((med) => {
    const dbMed = findMedicine(med.name);

    const category = dbMed?.category || "General";
    const frequency = getFrequency(med.timing);

    // extract number from "5 days"
    const duration =
      parseInt(med.quantity?.match(/\d+/)?.[0]) || 5;

    const risk = riskLevel(category);

    // charts
    durationChart.push({
      medicine_name: med.name,
      duration_days: duration,
    });

    dosageChart.push({
      medicine_name: med.name,
      frequency_per_day: frequency,
    });

    riskChart.push({
      medicine_name: med.name,
      risk_level: risk,
    });

    usageCounter[category] = (usageCounter[category] || 0) + 1;
  });

  const usageChart = Object.keys(usageCounter).map((key) => ({
    usage_type: key,
    count: usageCounter[key],
  }));

  // Statistics
  const total = medicines.length;
  const uniqueMeds = new Set(medicines.map(m => m.name.toLowerCase().trim())).size;
  const highRisk = riskChart.filter(r => r.risk_level === 3).length;

  return {
    disclaimer:
      "This dashboard is for information only. Follow doctor prescription strictly.",
    stats: {
        total_medicines: total,
        active_medicines: uniqueMeds,
        high_risk_count: highRisk
    },
    chart_data: {
      medicine_duration_chart: durationChart,
      daily_dosage_chart: dosageChart,
      side_effect_risk_chart: riskChart,
      medicine_usage_chart: usageChart,
    },
  };
}
