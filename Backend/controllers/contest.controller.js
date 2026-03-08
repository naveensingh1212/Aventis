import axios from 'axios';
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import 'dotenv/config';

/**
 * Get Codeforces Upcoming Contests
 */
const getCodeforcesContests = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list', {
      timeout: 10000,
      params: { gym: false }
    });

    const contests = response.data.result
      .filter(c => c.phase === 'BEFORE')
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        name: c.name,
        startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
        duration: c.durationSeconds / 60,
        platform: 'Codeforces',
        url: `https://codeforces.com/contest/${c.id}`,
        type: c.type
      }));

    res.status(200).json(new ApiResponse(200, contests, "Codeforces upcoming contests fetched successfully"));

  } catch (error) {
    console.error("Codeforces Contests Error:", error.message);
    throw new ApiError(500, "Failed to fetch Codeforces contests");
  }
});

/**
 * Get LeetCode Upcoming Contests
 */
const getLeetCodeContests = asyncHandler(async (req, res) => {
  try {
    const graphqlQuery = {
      operationName: "ContestsList",
      query: `
        query ContestsList {
          topPublicContests(limit: 50) {
            contests {
              id
              title
              titleSlug
              description
              startTime
              duration
              originStartTime
            }
          }
        }
      `,
      variables: {}
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 10000
    });

    if (!response.data?.data?.topPublicContests?.contests) {
      console.log("LeetCode response structure:", response.data);
      throw new Error("Unexpected response structure from LeetCode");
    }

    const now = Date.now() / 1000;
    const contests = response.data.data.topPublicContests.contests
      .filter(c => c.startTime > now)
      .slice(0, 15)
      .map(c => ({
        id: c.id,
        title: c.title,
        startTime: new Date(c.startTime * 1000).toISOString(),
        endTime: new Date((c.startTime + c.duration) * 1000).toISOString(),
        duration: Math.round(c.duration / 60),
        platform: 'LeetCode',
        url: `https://leetcode.com/contest/${c.titleSlug}`,
        description: c.description
      }));

    res.status(200).json(new ApiResponse(200, contests, "LeetCode upcoming contests fetched successfully"));

  } catch (error) {
    console.error("LeetCode Contests Error:", error.message);
    throw new ApiError(500, `Failed to fetch LeetCode contests: ${error.message}`);
  }
});

/**
 * Get CodeChef Upcoming Contests (via Kontests public API)
 */
const getCodeChefContests = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get('https://kontests.net/api/v1/codechef', { timeout: 10000 });

    if (!Array.isArray(response.data)) {
      console.log('CodeChef response unexpected:', response.data);
      throw new Error('Unexpected response from CodeChef source');
    }

    const now = Date.now();
    const contests = response.data
      .filter(c => {
        const s = new Date(c.start_time).getTime();
        return s > now;
      })
      .slice(0, 20)
      .map(c => ({
        id: c.name || c.title,
        title: c.name || c.title,
        name: c.name || c.title,
        startTime: new Date(c.start_time).toISOString(),
        endTime: new Date(c.end_time).toISOString(),
        duration: Math.round((Number(c.duration) || 0) / 60),
        platform: 'CodeChef',
        url: c.url,
        site: c.site
      }));

    res.status(200).json(new ApiResponse(200, contests, 'CodeChef upcoming contests fetched successfully'));
  } catch (error) {
    console.error('CodeChef Contests Error:', error.message);
    throw new ApiError(500, 'Failed to fetch CodeChef contests');
  }
});

export { getCodeforcesContests, getLeetCodeContests, getCodeChefContests };s