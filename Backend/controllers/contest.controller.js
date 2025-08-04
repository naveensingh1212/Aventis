import fetch from 'node-fetch';
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import 'dotenv/config';
const CLIST_USERNAME = process.env.CLIST_USERNAME;
const CLIST_API_KEY = process.env.CLIST_API_KEY;

const getContest = asyncHandler(async(req, res) => {
    // Construct the authenticated URL with API key
    const url = `https://clist.by/api/v4/contest/?username=${CLIST_USERNAME}&api_key=${CLIST_API_KEY}&limit=100`;
    
    // Perform the fetch request
    const response = await fetch(url);
    
    console.log(`Clist API responded with status: ${response.status} ${response.statusText}`);
    console.log(`Fetching from: ${url}`);
    // Check if the response was successful
    if (!response.ok) {
        throw new ApiError(response.status, 'Failed to fetch contests from Clist API');
    }

    const data = await response.json();

    // Send a consistent success response using ApiResponse
    res.status(200).json(
        new ApiResponse(200, data.objects, 'Contests fetched successfully')
    );
});

// Use a named export to make the function available
export default getContest;