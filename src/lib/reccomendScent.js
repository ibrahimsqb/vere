import { supabase } from "./supabase";

const WEIGHTS = {
  weather: 0.4,
  recencyPenalty: 0.3,
  frequencyBoost: 0.3,
};

const WEATHER_MATCH = {
  hot: ["fresh", "citrus", "aquatic"],
  mild: ["floral", "green", "woody"],
  cold: ["oriental", "spicy", "gourmand", "woody"],
};

async function fetchFragrances(userId) {
  const { data, error } = await supabase.from("fragrances").select("*").eq("user_id", userId);

  if (error) {
    console.error("Fragrances query error:", error);
    throw error;
  }

  return data || [];
}

async function fetchWearLogs(userId) {
  const { data, error } = await supabase.from("wear_logs").select("*").eq("user_id", userId);

  if (error) throw error;

  return data || [];
}

function calculateWeatherScore(fragrance, weather) {
  if (!weather) {
    return 0;
  }

  const compatibleTypes = WEATHER_MATCH[weather.tempCategory] || [];

  return compatibleTypes.includes(fragrance.scent_family?.toLowerCase()) ? 1 : 0;
}

function calculateRecencyPenalty(fragranceId, wearLogs) {
  const logs = wearLogs.filter((log) => log.fragrance_id === fragranceId);

  if (logs.length === 0) {
    return 1;
  }

  const lastWorn = new Date([...logs].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date);

  const daysSinceWear = (Date.now() - lastWorn.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceWear >= 7) return 1;
  if (daysSinceWear >= 3) return 0.7;

  return 0.3;
}

function calculateFrequencyBoost(fragranceId, wearLogs) {
  const count = wearLogs.filter((log) => log.fragrance_id === fragranceId).length;

  return Math.min(count / 10, 1);
}

function generateReason(fragrance, weather) {
  if (!weather) {
    return "A versatile pick from your collection.";
  }

  return `Great choice for ${weather.tempCategory} weather and aligns with your wearing habits.`;
}

export async function recommendScent(weather) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("No authenticated user");
      return null;
    }

    const fragrances = await fetchFragrances(user.id);
    const wearLogs = await fetchWearLogs(user.id);

    console.log("Fragrances found:", fragrances.length);
    console.log("Wear logs found:", wearLogs.length);

    if (fragrances.length === 0) {
      console.log("No fragrances in database");
      return null;
    }

    const scoredFragrances = fragrances.map((fragrance) => {
      const weatherScore = calculateWeatherScore(fragrance, weather);
      const recencyScore = calculateRecencyPenalty(fragrance.id, wearLogs);
      const frequencyScore = calculateFrequencyBoost(fragrance.id, wearLogs);

      const totalScore = weatherScore * WEIGHTS.weather + recencyScore * WEIGHTS.recencyPenalty + frequencyScore * WEIGHTS.frequencyBoost;

      return {
        fragrance,
        score: totalScore,
        reason: generateReason(fragrance, weather),
      };
    });

    scoredFragrances.sort((a, b) => b.score - a.score);
    return scoredFragrances[0];
  } catch (error) {
    console.log("Recommendation error:", error);
    return null;
  }
}
