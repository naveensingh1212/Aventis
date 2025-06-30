import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Helper function to determine difficulty styling
const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: 'bg-green-600',
    medium: 'bg-yellow-600',
    hard: 'bg-red-600'
  };
  return colors[difficulty.toLowerCase()] || 'bg-gray-600';
};

// Helper function to map Codeforces rating to difficulty
const getCodeforcesdifficulty = (rating) => {
  if (!rating) return { difficulty: 'Medium', color: 'bg-yellow-600' };
  
  if (rating < 1200) return { difficulty: 'Easy', color: 'bg-green-600' };
  if (rating < 1700) return { difficulty: 'Medium', color: 'bg-yellow-600' };
  return { difficulty: 'Hard', color: 'bg-red-600' };
};

/**
 * Get LeetCode Problem of the Day
 */
const getLeetCodePotd = asyncHandler(async (req, res) => {
  try {
    const graphqlQuery = {
      query: `
        query questionOfToday {
          activeDailyCodingChallengeQuestion {
            date
            link
            question {
              difficulty
              title
            }
          }
        }
      `
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: { 'Content-Type': 'application/json' }
    });

    const potd = response.data.data.activeDailyCodingChallengeQuestion;
    
    if (!potd?.question) {
      throw new ApiError(404, "LeetCode Problem of the Day not found");
    }

    const result = {
      platform: 'LeetCode',
      date: potd.date,
      title: potd.question.title,
      difficulty: potd.question.difficulty,
      link: `https://leetcode.com${potd.link}`,
      difficultyColor: getDifficultyColor(potd.question.difficulty)
    };

    res.status(200).json(new ApiResponse(200, result, "LeetCode POTD fetched successfully"));

  } catch (error) {
    console.error("LeetCode POTD Error:", error.message);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.statusText || error.message;
      throw new ApiError(status, `Failed to fetch LeetCode POTD: ${message}`);
    }
    
    throw error;
  }
});

/**
 * Get Random Codeforces Problem (as POTD)
 */
const getCodeforcesPotd = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get('https://codeforces.com/api/problemset.problems', {
      timeout: 10000
    });

    const problems = response.data.result.problems;
    
    if (!problems?.length) {
      throw new ApiError(404, "No problems found from Codeforces API");
    }

    // Filter problems that have contest IDs for proper links
    const validProblems = problems.filter(p => p.contestId);
    
    if (!validProblems.length) {
      throw new ApiError(404, "No suitable problems found after filtering");
    }

    // Pick random problem
    const randomProblem = validProblems[Math.floor(Math.random() * validProblems.length)];
    const { difficulty, color } = getCodeforcesdifficulty(randomProblem.rating);

    const result = {
      platform: 'Codeforces',
      title: randomProblem.name,
      link: `https://codeforces.com/problemset/problem/${randomProblem.contestId}/${randomProblem.index}`,
      difficulty,
      difficultyColor: color,
      retrievedAt: new Date().toISOString()
    };

    res.status(200).json(new ApiResponse(200, result, "Random Codeforces problem fetched successfully"));

  } catch (error) {
    console.error("Codeforces POTD Error:", error.message);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.statusText || error.message;
      throw new ApiError(status, `Failed to fetch Codeforces problem: ${message}`);
    }
    
    throw new ApiError(500, `Unexpected error: ${error.message}`);
  }
});

export { getLeetCodePotd, getCodeforcesPotd };