"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
window.addEventListener('load', init);
const APIkey = "WJ2S8Y8BM204TYD6"; // "TLUYLC7Y5VCCJC9A"
let globalYTDTrack = 0;
let globalStockRes; // Adjust the type according to your API response structure
let globalSPRes; // Adjust the type according to your API response structure
let ticker; // Adjust the type according to your usage
let buyCandidates = [];
let moonCandidates = [];
let pennyCandidates = [];
let superGainerCandidates = [];
let freshHotBuyCandidates = [];
let indexYTD = 0;
function init() {
    document.getElementById('new_research').addEventListener('click', conductNewResearch);
    document.getElementById('submission_research').addEventListener('click', function (el) {
        // prevent automatic page refresh behavior
        el.preventDefault();
        doResearch();
    });
}
function conductNewResearch() {
    document.querySelector('.new_port').style.display = 'block';
    document.querySelector('#new_research').style.display = 'none';
}
function doResearch() {
    // Extract ticker symbol from the user
    ticker = document.getElementById("research_stock_ticker").value;
    const URL = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=" + ticker + "&apikey=" + APIkey;
    fetch(URL)
        .then(statusCheck)
        .then(res => res.json())
        .then(calculateResearch)
        .catch(handleErr);
}
// Calculates a stock / security price and corresponding info based upon what stock, 
// when the user invested, and how much they put into the security / stock.
function calculateResearch(res) {
    let lastRefreshedYear = res['Meta Data']['3. Last Refreshed'].split('-')[0];
    if (res && res['Error Message'] && res['Error Message'].includes("Invalid API call.")) {
        console.log("You looked up a non-existent stock! Try again.");
    }
    globalStockRes = res;
    let updatedInfo = res['Weekly Adjusted Time Series'];
    ticker = ticker.toLowerCase();
    // Extract the total length of API response (in weeks)
    let length = Object.keys(updatedInfo).length;
    let newGraphBackground = document.createElement('img');
    newGraphBackground.src = "https://media.istockphoto.com/id/1341800395/vector/grid-paper-mathematical-graph-cartesian-coordinate-system-with-x-axis-y-axis-squared.jpg?s=612x612&w=0&k=20&c=Jcq_YJw1cEufocBwcUu9N1BxXErtlYSr3FLYFyFFKAM=";
    newGraphBackground.onload = function () {
        // Set up the graph of API weeks and initialize pre-sets 
        // Hard-coded constants have been tailored based on specifics of the graph image, where possible magic numbers
        // have been avoided
        let pixelDistanceWidth = (((newGraphBackground.x + 452) - (newGraphBackground.x + 24)) / (length));
        // Create a height scaling score to adjust the vertical distance between dots depending 
        // on how much the stock price has increased over its lifetime. Automatically adjusts 
        // depending on how good / bad of a run a stock has had. 
        let heightScaleScore = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'] / updatedInfo[Object.keys(updatedInfo)[length - 1]]['5. adjusted close'];
        let biggestAdjCloseEverSeenForStock = 0;
        let lowestAdjCloseEverSeenForStock = 10000000000;
        // Keep track of respective intervals to print price / date information in overall stock lifetime
        let intervalCount = 1;
        let mostRecentClose = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'];
        let firstEverAdjClose = updatedInfo[Object.keys(updatedInfo)[length - 1]]['5. adjusted close'];
        firstEverAdjClose = Number(firstEverAdjClose);
        mostRecentClose = Number(mostRecentClose);
        let y_intervals = 0;
        let adjCloseTotalDifference = mostRecentClose - firstEverAdjClose;
        let adjClosePriceInterval = adjCloseTotalDifference / 4;
        adjClosePriceInterval = Number(adjClosePriceInterval);
        for (let i = 0; i < length; i++) {
            let dot = document.createElement('span');
            dot.addEventListener('mouseover', () => {
                // Show the date of the dot when hovered over by user
                let dotDate = document.createElement('p');
                dotDate.textContent = Object.keys(updatedInfo)[i];
                dotDate.id = 'dot#' + dot.id;
                dotDate.classList.add('dot_label');
                dotDate.style.left = 200 + ((length - i) * pixelDistanceWidth) + "px";
                dotDate.style.top = 700 - ((300 / heightScaleScore) * (adjustedCurrentClose / firstEverAdjClose)) + "px";
                document.getElementById('graph').appendChild(dotDate);
            });
            // Toggle back to default dot look
            dot.addEventListener('mouseout', () => {
                let currDot = document.getElementById('dot#' + dot.id);
                document.getElementById('graph').removeChild(currDot);
            });
            dot.classList.add('dot');
            document.getElementById('graph').appendChild(dot);
            dot.style.left = 340 + ((length - i) * pixelDistanceWidth) + "px";
            let adjustedCurrentClose = updatedInfo[Object.keys(updatedInfo)[i]]['5. adjusted close'];
            if (adjustedCurrentClose >= biggestAdjCloseEverSeenForStock) {
                biggestAdjCloseEverSeenForStock = adjustedCurrentClose;
            }
            if (adjustedCurrentClose <= lowestAdjCloseEverSeenForStock) {
                lowestAdjCloseEverSeenForStock = adjustedCurrentClose;
            }
            if (i == 0 || (i % Math.floor((length - 1) / 4) == 0)) {
                // For intervals of fifths, display graphically the year and price of the stock
                let yearLabel = document.createElement('span');
                let priceLabel = document.createElement('span');
                yearLabel.textContent = (Object.keys(updatedInfo)[i]).toString().split("-")[0];
                let closeAdj;
                if (y_intervals == 0) {
                    closeAdj = firstEverAdjClose;
                }
                else if (y_intervals < 4) {
                    closeAdj = firstEverAdjClose + (adjClosePriceInterval * y_intervals);
                }
                else {
                    closeAdj = mostRecentClose;
                }
                closeAdj = closeAdj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                priceLabel.textContent = closeAdj;
                yearLabel.classList.add('x_axis_label');
                priceLabel.classList.add('x_axis_label');
                priceLabel.style.left = 300 + "px";
                priceLabel.style.top = 575 - (70 * intervalCount) + "px";
                yearLabel.style.top = 545 + "px";
                yearLabel.style.right = 260 + (103 * intervalCount) + "px";
                intervalCount++;
                let graphObj = document.getElementById('graph');
                graphObj.appendChild(yearLabel);
                graphObj.appendChild(priceLabel);
                y_intervals++;
            }
            dot.style.top = 525 - ((300 / heightScaleScore) * (adjustedCurrentClose / firstEverAdjClose)) + "px";
        }
        let dotArray = document.querySelectorAll('.dot');
        // If the stock has gone up since the very first time it came on the market (IPO or similar),  
        // color the dot to be green 
        if (firstEverAdjClose < mostRecentClose) {
            dotArray = document.querySelectorAll('.dot');
            for (let z = 0; z < dotArray.length; z++) {
                dotArray[z].style.backgroundColor = 'green';
            }
        }
        else {
            // Otherwise color the dot to be red if it has since gone down in price
            for (let z = 0; z < dotArray.length; z++) {
                dotArray[z].style.backgroundColor = 'red';
            }
        }
        document.getElementById('graph').appendChild(newGraphBackground);
        if (lastRefreshedYear >= 2024) {
            calculateMomentum(res);
        }
    };
}
// Looks at 10, 5, 2, and 1 year (YTD) intervals of the stocks performance across 
// each of these windows. Assigns a rating to the stock based upon its performance over a 10 year 
// and 5 year timeline. Also calculates the YTD performance of the stock vs the S&P500 as a benchmark
function calculateMomentum(res) {
    const updatedInfo = res['Weekly Adjusted Time Series'];
    // Grab the current date that the user searched on (today's date)
    const currDate = Object.keys(updatedInfo)[0];
    const dateArray = currDate.split('-');
    const currYear = parseInt(dateArray[0]);
    const currMonth = parseInt(dateArray[1]);
    const currDay = parseInt(dateArray[2]);
    const tenOldYear = currYear - 10;
    const fiveOldYear = currYear - 5;
    const twoOldYear = currYear - 2;
    const oneOldYear = currYear - 1;
    // Finds the closest entry to the respective date (in this case 10 years ago from when the user searched)
    // and returns the corresponding index to be used in calculating the return based upon that yield
    let indexTen = findEntry(tenOldYear, currMonth, currDay, res);
    let tenYearAdjClose = updatedInfo[Object.keys(updatedInfo)[indexTen]]['5. adjusted close'];
    let indexFive = findEntry(fiveOldYear, currMonth, currDay, res);
    let fiveYearAdjClose = updatedInfo[Object.keys(updatedInfo)[indexFive]]['5. adjusted close'];
    let indexStart = findEntry(2020, 9, 21, res);
    let startAdjClose = updatedInfo[Object.keys(updatedInfo)[indexStart]]['5. adjusted close'];
    let indexTwo = findEntry(twoOldYear, currMonth, currDay, res);
    let twoYearAdjClose = updatedInfo[Object.keys(updatedInfo)[indexTwo]]['5. adjusted close'];
    let indexOne = findEntry(oneOldYear, currMonth, currDay, res);
    let oneYearAdjClose = updatedInfo[Object.keys(updatedInfo)[indexOne]]['5. adjusted close'];
    indexYTD = findEntry(currYear, 1, 1, res);
    let YTDAdjClose = updatedInfo[Object.keys(updatedInfo)[indexYTD]]['5. adjusted close'];
    // The market price of what the security is currently going for on the stock market
    let marketPrice = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'];
    // Initial investment is set using $10,000 standard (common practice in investment community)
    let initialInvestment = 10000;
    // Dynamically create a scaler that allows the user to adjust their initial amount invested into the stock
    let initialInvestmentContainer = document.createElement('div');
    initialInvestmentContainer.classList.add("slider-container");
    let investmentLabel = document.createElement('label');
    investmentLabel.htmlFor = "invest_slider";
    let investmentInput = document.createElement('input');
    investmentInput.id = "slider";
    investmentInput.type = "range";
    investmentInput.min = "1000";
    investmentInput.max = "100000";
    investmentInput.value = "10000";
    investmentInput.step = "1000";
    initialInvestmentContainer.textContent = "Choose your initial investment amount:";
    let investmentText = document.createElement('p');
    investmentText.textContent = "Investing: $" + initialInvestment;
    initialInvestmentContainer.appendChild(investmentLabel);
    initialInvestmentContainer.appendChild(investmentInput);
    initialInvestmentContainer.appendChild(investmentText);
    investmentInput.addEventListener('input', function () {
        investmentText.textContent = "Investing: $" + investmentInput.value;
        initialInvestment = parseInt(investmentInput.value);
        // clear out previous content but only from the investment amounts (not the SP comparison)
        document.getElementById('investment_scaler_container').innerHTML = "";
        displayYieldValues(initialInvestment, tenYearAdjClose, fiveYearAdjClose, twoYearAdjClose, startAdjClose, oneYearAdjClose, YTDAdjClose, marketPrice);
    });
    // Add class to display visual styling and scaling capabilities
    document.getElementById('momentum_slider').appendChild(initialInvestmentContainer);
    displayYieldValues(initialInvestment, tenYearAdjClose, fiveYearAdjClose, twoYearAdjClose, startAdjClose, oneYearAdjClose, YTDAdjClose, marketPrice);
    let YTDValue = document.createElement('p');
    globalYTDTrack = ((10000 / YTDAdjClose) * marketPrice);
    calculateSP500Rating(((10000 / YTDAdjClose) * marketPrice));
    let investmentValueYTDLater = ((initialInvestment / YTDAdjClose) * marketPrice);
    YTDValue.textContent = "Your investment's YTD yield would be: " + investmentValueYTDLater.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('momentum').appendChild(YTDValue);
}
// Bulk function to display all of the yields tenYear to YTD.
function displayYieldValues(initialInvestment, tenYearAdjClose, fiveYearAdjClose, twoYearAdjClose, startAdjClose, oneYearAdjClose, YTDAdjClose, marketPrice) {
    let scalerContainer = document.getElementById('investment_scaler_container');
    // Check to see if the scalerContainerAlready exists, and if it does get rid of itself
    // to make room for new content
    if (scalerContainer) {
        document.getElementById('momentum').removeChild(scalerContainer);
    }
    let investmentScalerContainer = document.createElement('div');
    investmentScalerContainer.id = 'investment_scaler_container';
    // Calculate initial investment yields based upon the $10,000 invested figure 
    let investmentValueTenYearsLater = ((initialInvestment / tenYearAdjClose) * marketPrice);
    let investmentValueFiveYearsLater = ((initialInvestment / fiveYearAdjClose) * marketPrice);
    let investmentValueTwoYearsLater = ((initialInvestment / twoYearAdjClose) * marketPrice);
    let investmentValueStartLater = ((initialInvestment / startAdjClose) * marketPrice);
    let investmentValueOneYearLater = ((initialInvestment / oneYearAdjClose) * marketPrice);
    let investmentValueYTDLater = ((initialInvestment / YTDAdjClose) * marketPrice);
    // Display the value that the security would be worth today if it was purchased 
    // in a $10,000 amount 10 years ago
    let tenValue = document.createElement('p');
    let tenRating = document.createElement('p');
    // Note that this score is based on my own algorithm using the 10000 investment standard, 
    // and accordingly the user is not allowed to alter this value (it would not affect the score anyways even if they could)
    let tenRatingScore = stockRatingTenYrYield(((10000 / tenYearAdjClose) * marketPrice));
    tenValue.textContent = "Your investment's 10-year yield would be: " + investmentValueTenYearsLater.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    tenRating.textContent = "Your investment's 10-year yield is rated at: " + tenRatingScore;
    investmentScalerContainer.appendChild(tenValue);
    investmentScalerContainer.appendChild(tenRating);
    let fiveValue = document.createElement('p');
    let fiveRating = document.createElement('p');
    let fiveRatingScore = stockRatingFiveYrYield(((10000 / fiveYearAdjClose) * marketPrice));
    fiveValue.textContent = "Your investment's 5-year yield would be: " + investmentValueFiveYearsLater.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    fiveRating.textContent = "Your investment's 5-year yield is rated at: " + fiveRatingScore;
    investmentScalerContainer.appendChild(fiveValue);
    investmentScalerContainer.appendChild(fiveRating);
    // Also display my start date for fun
    let startValue = document.createElement('p');
    startValue.textContent = "Your investment's yield since Elias' start (9/21/20) would be: " + investmentValueStartLater.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    investmentScalerContainer.appendChild(startValue);
    let twoValue = document.createElement('p');
    twoValue.textContent = "Your investment's 2-year yield would be: " + investmentValueTwoYearsLater.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    investmentScalerContainer.appendChild(twoValue);
    let oneValue = document.createElement('p');
    oneValue.textContent = "Your investment's 1-year yield would be: " + investmentValueOneYearLater.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    investmentScalerContainer.appendChild(oneValue);
    document.getElementById('momentum').insertAdjacentElement("afterbegin", investmentScalerContainer);
}
// "Grades" the stock based upon how much the investment grew to from an 
// initial $10,000 investment over 10 years. 
// NOTE: This is subjective and my personal rating system based upon 
// researching and being involved in the stock market for four years and change (no pun intended)
// Returns: A numeric letter rating of how the security did over the given period
function stockRatingTenYrYield(yieldValue) {
    let TenYearYieldRating;
    if (yieldValue >= 150000) {
        TenYearYieldRating = "A+";
    }
    else if (yieldValue >= 100000) {
        TenYearYieldRating = "A";
    }
    else if (yieldValue >= 90000) {
        TenYearYieldRating = "A-";
    }
    else if (yieldValue >= 80000) {
        TenYearYieldRating = "B+";
    }
    else if (yieldValue >= 70000) {
        TenYearYieldRating = "B";
    }
    else if (yieldValue >= 60000) {
        TenYearYieldRating = "B-";
    }
    else if (yieldValue >= 50000) {
        TenYearYieldRating = "C+";
    }
    else if (yieldValue >= 40000) {
        TenYearYieldRating = "C";
    }
    else if (yieldValue >= 30000) {
        TenYearYieldRating = "C-";
    }
    else if (yieldValue >= 20000) {
        TenYearYieldRating = "D";
    }
    else if (yieldValue >= 10000) {
        TenYearYieldRating = "D-";
    }
    else {
        TenYearYieldRating = "F";
    }
    return TenYearYieldRating;
}
// "Grades" the stock based upon how much the investment grew to from an 
// initial $10,000 investment over four years. 
// NOTE: This is subjective and my personal rating system based upon 
// researching and being involved in the stock market for four years and change (no pun intended)
// Returns: A numeric letter rating of how the security did over the given period
function stockRatingFiveYrYield(yieldValue) {
    let FiveYearYieldRating;
    if (yieldValue >= 32500) {
        FiveYearYieldRating = "A+";
    }
    else if (yieldValue >= 20000) {
        FiveYearYieldRating = "A";
    }
    else if (yieldValue >= 17500) {
        FiveYearYieldRating = "A-";
    }
    else if (yieldValue >= 15000) {
        FiveYearYieldRating = "B";
    }
    else if (yieldValue >= 10000) {
        FiveYearYieldRating = "C";
    }
    else if (10000 > yieldValue && yieldValue >= 7500) {
        FiveYearYieldRating = "D";
    }
    else {
        FiveYearYieldRating = "F";
    }
    return FiveYearYieldRating;
}
// Calculates the SP500 Rating (using as a measurable standard to compare a security against)
// NOTE: "VOO" represents Vanguard's particular S&P500 security tracker, but this is an arbitrary selection
// In the personal finance / brokerage community, people generally tend to lean towards Vanguard for mutual funds / etfs, 
// hence this is used as the standard to compare against here.
function calculateSP500Rating(stockYTD) {
    let URL = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=VOO&apikey=" + APIkey;
    fetch(URL)
        .then(statusCheck)
        .then(res => res.json())
        .then(SP500YTD)
        .catch(handleErr);
}
// Tracks how much the security has grown since the YTD (January 1st of the current year)
// Assumes that the security should be outperforming the S&P500 in order to receive 
// a positive rating, and hence is simply a measurement to be compared 
// with other tools to determine a security's actual value or investment worth.
function SP500YTD(res) {
    globalSPRes = res;
    var updatedInfo = res['Weekly Adjusted Time Series'];
    let marketPrice500 = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'];
    let YTDAdjClose500 = updatedInfo[Object.keys(updatedInfo)[indexYTD]]['5. adjusted close'];
    let investmentValue500YTDLater = ((10000 / YTDAdjClose500) * marketPrice500);
    let SP500Rating = "";
    if (globalYTDTrack >= (investmentValue500YTDLater * 1.2)) {
        SP500Rating = "A";
    }
    else if (globalYTDTrack >= (investmentValue500YTDLater * 1.1)) {
        SP500Rating = "B";
    }
    else if (globalYTDTrack >= (investmentValue500YTDLater * 1.025)) {
        SP500Rating = "B-";
    }
    else if ((investmentValue500YTDLater * 0.975) <= globalYTDTrack && globalYTDTrack < (investmentValue500YTDLater * 1.025)) {
        SP500Rating = "C";
    }
    else if (globalYTDTrack < (investmentValue500YTDLater * 0.975)) {
        SP500Rating = "C-";
    }
    else if (globalYTDTrack < (investmentValue500YTDLater * 0.95)) {
        SP500Rating = "D";
    }
    else if (globalYTDTrack < (investmentValue500YTDLater * 0.90)) {
        SP500Rating = "F";
    }
    let SP500Txt = document.createElement('p');
    SP500Txt.textContent = "Your investment's YTD-yield vs. the S&P500 is rated at: " + SP500Rating;
    const momentumElement = document.getElementById('momentum');
    if (momentumElement) {
        momentumElement.appendChild(SP500Txt);
    }
    else {
        console.error("Element with ID 'momentum' not found.");
    }
    calculatePerformanceVSSP500(res);
}
// Calculates how many years the stock has outperformed the S&P500, (also shows how the YTD % change feature that can be toggled on/off)
// Is also color-coded to be red if the stock's ratio is less than 1 (indicating losses) or green (> 1 means gains). Same goes for S&P500
// also fix the updating that completely clears the SPPerformance feature: 
// and creates a detailed report with which exact years it outperformed the S&P500 in terms of yield
// Only starts looking at the earliest year both the stock being researched / S&P500 have market info for valid comparison
// of the overlapping year ranges. 
function calculatePerformanceVSSP500(res) {
    let updatedStockInfo = globalStockRes['Weekly Adjusted Time Series'];
    let updatedSPInfo = globalSPRes['Weekly Adjusted Time Series'];
    // Use our existing functions to figure out the oldest date the stock is on the market (of API data)
    let oldestStockDate = findOldestEntry(globalStockRes['Weekly Adjusted Time Series']);
    let parsedStockDate = oldestStockDate.split("-");
    let startingStockYear = parseInt(parsedStockDate[0]);
    // startingStockYear = parseInt(startingStockYear);
    // Take the next year after the earliest stock year to have a guaranteed January start to the year
    let oldestSPDate = findOldestEntry(globalSPRes['Weekly Adjusted Time Series']);
    let parsedSPDate = oldestSPDate.split("-");
    let startingSPYear = parseInt(parsedSPDate[0]);
    // startingSPYear = parseInt(startingSPYear);
    // Set the universal stock year to be the latest possible year (max) between the two securities
    let universalStartYear = Math.max(startingSPYear, startingStockYear);
    // universalStartYear = parseInt(universalStartYear);
    let universalEndYearDate = Object.keys(globalStockRes['Weekly Adjusted Time Series'])[0];
    let universalEndYearArray = universalEndYearDate.split("-");
    let universalEndYear = parseInt(universalEndYearArray[0]);
    // universalEndYear = parseInt(universalEndYear);
    let SPExceedDiv = document.createElement('div');
    SPExceedDiv.id = 'SPExceeded';
    let SPHeading = document.createElement('h3');
    SPHeading.textContent = "S&P500 exceeded Stock for the following year(s): ";
    SPExceedDiv.appendChild(SPHeading);
    let StockExceedDiv = document.createElement('div');
    StockExceedDiv.id = 'StockExceeded';
    let StockHeading = document.createElement('h3');
    StockHeading.textContent = "Stock exceeded S&P500 for the following year(s): ";
    StockExceedDiv.appendChild(StockHeading);
    let totalYears = 0;
    let outPerf = 0;
    let decYear = 0;
    let underPGain = 0;
    let underPLoss = 0;
    let consecOutPerform = 0;
    let consecYearStart = 0;
    let consecYearArray = [];
    let yesBuy = false;
    let mostRecentBuyYear = 0;
    let firstEverBuyYear = 0;
    let recentOut = 0;
    let moonCandidate = false;
    let moonMultiplier = 0;
    let moonConfirmed = false;
    let pennyCandidate = false;
    let pennyConfirmed = false;
    let superGainerConfirmed = false;
    let summary = document.getElementById('summary');
    let momentum = document.getElementById('momentum');
    let overall_rating = document.getElementById('overall_rating');
    // Stops 2 years earlier than the current year to ensure that YTD extends to the proper range
    // Try only stopping 1 year before? We are missing all of 2023-2024.... bruh!
    for (let currYear = universalStartYear; currYear < universalEndYear; currYear++) {
        totalYears = totalYears + 1;
        let januaryStockIndex = findEntry(currYear, 1, 1, globalStockRes);
        // Insert 1 year gap to simulate YTD calculation
        let nextJanuaryStockIndex = findEntry(currYear + 1, 1, 1, globalStockRes);
        // Grab the adjusted close prices for the stock
        let januaryStockAdj = updatedStockInfo[Object.keys(updatedStockInfo)[januaryStockIndex]]['5. adjusted close'];
        let nextJanuaryStockAdj = updatedStockInfo[Object.keys(updatedStockInfo)[nextJanuaryStockIndex]]['5. adjusted close'];
        // Perform the same YTD calculation but for the S&P500
        let januarySPIndex = findEntry(currYear, 1, 1, globalSPRes);
        let nextJanuarySPIndex = findEntry(currYear + 1, 1, 1, globalSPRes);
        let januarySPAdj = updatedSPInfo[Object.keys(updatedSPInfo)[januarySPIndex]]['5. adjusted close'];
        let nextJanuarySPAdj = updatedSPInfo[Object.keys(updatedSPInfo)[nextJanuarySPIndex]]['5. adjusted close'];
        // Format the string for display to the user
        let yearString = `${currYear}-${currYear + 1}`;
        let yearArrayHeading = document.createElement('p');
        yearArrayHeading.textContent = "" + yearString + "(" + ticker.toUpperCase() + ": " + (nextJanuaryStockAdj / januaryStockAdj).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ")";
        if (nextJanuaryStockAdj / januaryStockAdj < 1) {
            yearArrayHeading.style['color'] = '#C21807';
            decYear = decYear + 1;
        }
        else if ((nextJanuaryStockAdj / januaryStockAdj < 0.40) && (nextJanuarySPAdj / januarySPAdj > 0.8)) {
            // This indicates stock volatility compared to market 
            console.log("unacceptable. Stock just died randomly for no reason. ");
        }
        else if (nextJanuaryStockAdj / januaryStockAdj >= 1.2) {
            consecYearArray[consecOutPerform] = currYear;
            consecOutPerform = consecOutPerform + 1;
            if (consecYearStart == 0) {
                consecYearStart = currYear;
            }
            else {
                if ((currYear - consecYearStart <= 3) && consecOutPerform >= 3) {
                    if (firstEverBuyYear == 0) {
                        firstEverBuyYear = Number(currYear + 1);
                    }
                    mostRecentBuyYear = Number(currYear + 1);
                    yesBuy = true;
                    let buyRecommendation = document.createElement('h4');
                    buyRecommendation.textContent = "I would have bought this stock on January 1st of the year: " + Number(currYear + 1);
                    let yearsOutPerformed = document.createElement('p');
                    yearsOutPerformed.textContent = "Based upon the trend observed over these years: " + consecYearArray;
                    if (summary) {
                        summary.appendChild(buyRecommendation);
                        summary.appendChild(yearsOutPerformed);
                    }
                    else {
                        console.log("Element with ID 'summary' not found");
                    }
                    consecYearStart = 0;
                    consecOutPerform = 0;
                    consecYearArray = [];
                }
                else if ((currYear - consecYearStart > 2)) {
                    consecYearStart = 0;
                    consecOutPerform = 0;
                    consecYearArray = [];
                }
            }
        }
        if (Number(universalEndYear - currYear) <= 4 && Number(januaryStockAdj) < 10) {
            if (Number(currYear + 1) == universalEndYear) {
                let januaryCurrentYearPrice = nextJanuaryStockAdj;
                let marketPriceCurrent = Number(updatedStockInfo[Object.keys(updatedStockInfo)[0]]['5. adjusted close']);
                if (marketPriceCurrent > (januaryCurrentYearPrice * 1.1) && marketPriceCurrent < 10) {
                    pennyConfirmed = true;
                    pennyCandidates.push(ticker.toUpperCase());
                }
            }
        }
        // Determine whether or not the stock exceeded the S&P500 for each year
        if (nextJanuarySPAdj / januarySPAdj > nextJanuaryStockAdj / januaryStockAdj) {
            SPExceedDiv.appendChild(yearArrayHeading);
            // If the market did better than the stock, but the stock still gained value (i.e., > 1.0)
            if ((nextJanuaryStockAdj / januaryStockAdj) > 1) {
                // Increase the underperformed but still gained counter
                underPGain = underPGain + 1;
            }
            else {
                underPLoss = underPLoss + 1;
            }
        }
        else {
            StockExceedDiv.appendChild(yearArrayHeading);
            outPerf = outPerf + 1;
            // SUNDAY WORK: also check if the stock beat the market and was > 1.2 for 2022-23 as that means its ready to moon
            // and also make sure and check that the current year is 2022 or 2023
            // Also add a feature where you see how much money its stock buy predictions would have made you since it told you to invest. 
            if (Number(currYear) == 2022 && (nextJanuaryStockAdj / januaryStockAdj) >= 1.1) {
                moonCandidate = true;
                moonMultiplier = (nextJanuaryStockAdj / januaryStockAdj);
            }
            else if (Number(currYear) == 2022 && (nextJanuaryStockAdj / januaryStockAdj) < 1.1) {
                moonCandidate = false;
                moonMultiplier = 0;
            }
            if (moonCandidate && Number(currYear) == 2023 && (nextJanuaryStockAdj / januaryStockAdj) >= 1.1 && (nextJanuaryStockAdj / januaryStockAdj) > moonMultiplier) {
                moonConfirmed = true;
            }
            else if (!moonCandidate && Number(currYear) == 2023) {
                moonCandidate = false;
                moonMultiplier = 0;
                moonConfirmed = false;
            }
            if (Number(universalEndYear - currYear) <= 4) {
                recentOut = recentOut + 1;
            }
        }
    }
    // Super gainer candidates
    if (((decYear / totalYears) <= 0.1 && recentOut >= 2)) {
        superGainerCandidates.push(ticker.toUpperCase());
        superGainerConfirmed = true;
    }
    let buyDecision = document.createElement('h3');
    buyDecision.classList.add('buy_decisions');
    if (yesBuy) {
        buyDecision.textContent = "Would I have bought this stock before:  Yes";
    }
    else {
        buyDecision.textContent = "Would I have bought this stock before:  Not Yet...";
    }
    // Summary and Momentum HTML element checks to ensure exist before appending information on front end
    if (summary) {
        summary.insertAdjacentElement("beforebegin", buyDecision);
    }
    else {
        console.log("HTML element: 'summary' does not exist");
    }
    if (momentum) {
        momentum.appendChild(StockExceedDiv);
        momentum.appendChild(SPExceedDiv);
    }
    else {
        console.log("HTML element: 'momentum' does not exist");
    }
    let final_decision = document.createElement('h3');
    let justification = document.createElement('h4');
    let just_year = document.createElement('h4');
    let just_money = document.createElement('h4');
    let overallBuyForCurrentYear = false;
    if (moonConfirmed || (Number(universalEndYear - mostRecentBuyYear) <= 4 && recentOut >= 2) || ((decYear / totalYears) <= 0.2 && recentOut >= 1) || (recentOut >= 3) || pennyConfirmed || superGainerConfirmed) {
        overallBuyForCurrentYear = true;
        buyCandidates.push(ticker.toUpperCase());
    }
    if (overallBuyForCurrentYear) {
        final_decision.textContent = 'Is this stock a Buy Candidate in the year 2024: Yes';
        // Provide overall reasoning for the decision
        if (moonConfirmed) {
            moonCandidates.push(ticker.toUpperCase());
            justification.textContent = 'This stock seems positioned to outperform based on recent trends and could skyrocket';
        }
        else if (superGainerConfirmed) {
            justification.textContent = 'This stock has proven to be significantly outperforming the market and is a super gainer';
        }
        else if ((Number(universalEndYear - mostRecentBuyYear) <= 4 && recentOut >= 2)) {
            justification.textContent = 'This stock would have been bought within the last few years, and has beat the market on average during the last few years';
        }
        else if ((recentOut >= 3)) {
            justification.textContent = 'This stock has beat the market significantly in recent years and warrants attention';
        }
        else if (pennyConfirmed) {
            justification.textContent = 'This stock is very cheap and has the potential to explode if the company is promising';
        }
        else if (((decYear / totalYears) <= 0.25 && recentOut >= 2)) {
            justification.textContent = 'This stock has historically gained value and remains relevant in the current market';
        }
        if (Number(mostRecentBuyYear) > 0) {
            just_year.textContent = 'The most recent buy year for this stock was: ' + mostRecentBuyYear;
            let indexMostRecentBuy = findEntry(Number(mostRecentBuyYear), 1, 1, globalStockRes);
            let mostRecentBuyAdjClose = updatedStockInfo[Object.keys(updatedStockInfo)[indexMostRecentBuy]]['5. adjusted close'];
            let marketPriceStock = updatedStockInfo[Object.keys(updatedStockInfo)[0]]['5. adjusted close'];
            let calculatedValue = (1000 / mostRecentBuyAdjClose) * marketPriceStock;
            just_money.textContent = 'If you would have put $1,000 into this stock on Jan 1st of the above year, your investment would now be worth: $' + Number(calculatedValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }
    else {
        final_decision.textContent = 'Should you buy this stock in the year 2024: No';
        justification.textContent = 'This stock did not consistently gain or beat the market during the last few years';
    }
    let hotFreshStock = document.createElement('h3');
    if (firstEverBuyYear == universalEndYear && universalEndYear == 2024) {
        freshHotBuyCandidates.push(ticker.toUpperCase());
        hotFreshStock.textContent = 'This stock would have just been purchased for the first time in the current year: ' + Number(universalEndYear);
    }
    let final_decision_greeting = document.createElement('h2');
    final_decision_greeting.textContent = 'Overall Decision for Stock:';
    overall_rating.appendChild(final_decision_greeting);
    overall_rating.appendChild(final_decision);
    overall_rating.appendChild(justification);
    overall_rating.appendChild(just_year);
    overall_rating.appendChild(just_money);
    overall_rating.appendChild(hotFreshStock);
    moonConfirmed = false;
    console.log("We got your buy candidates here:");
    console.log(buyCandidates);
    console.log("We got your moon candidates here:");
    console.log(moonCandidates);
    console.log("We got your freshHot 2024 buys here:");
    console.log(freshHotBuyCandidates);
    console.log("We got your penny candidates here:");
    console.log(pennyCandidates);
    console.log("We got your super gainer candidates here:");
    console.log(superGainerCandidates);
    let reset_greeting = document.createElement('h2');
    reset_greeting.textContent = 'Ready to do more Research?';
    let reset_button = document.createElement('button');
    reset_button.addEventListener('click', function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        (_b = (_a = document.getElementById('graph')) === null || _a === void 0 ? void 0 : _a.innerHTML) !== null && _b !== void 0 ? _b : '';
        (_d = (_c = document.getElementById('momentum_slider')) === null || _c === void 0 ? void 0 : _c.innerHTML) !== null && _d !== void 0 ? _d : '';
        (_f = (_e = document.getElementById('momentum')) === null || _e === void 0 ? void 0 : _e.innerHTML) !== null && _f !== void 0 ? _f : '';
        (_h = (_g = document.getElementById('summary')) === null || _g === void 0 ? void 0 : _g.innerHTML) !== null && _h !== void 0 ? _h : '';
        (_k = (_j = document.getElementById('overall_rating')) === null || _j === void 0 ? void 0 : _j.innerHTML) !== null && _k !== void 0 ? _k : '';
        (_m = (_l = document.getElementById('research_stock_ticker')) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : '';
        let buyDecisions = document.querySelectorAll('.buy_decisions');
        for (let buyD = 0; buyD < buyDecisions.length; buyD++) {
            buyDecisions[buyD].innerHTML = '';
        }
    });
    reset_button.textContent = 'Reset';
    overall_rating.appendChild(reset_greeting);
    overall_rating.appendChild(reset_button);
}
// Finds the closest entry in the API week list based upon 
// a provided year, month, and date. Returns the index of the week which 
// is closest to the provided year, month, and day input. 
// Returns: The closest index (entry) in API response to the given date the user is requesting 
function findEntry(year, month, day, response) {
    var updatedInfo = response['Weekly Adjusted Time Series'];
    let length = Object.keys(updatedInfo).length;
    let minIndex = 0;
    let min = 100000;
    for (let i = 0; i < length; i++) {
        let tuple = Object.keys(updatedInfo)[i];
        let tupleData = tuple.split('-');
        if (tupleData[0] == year) {
            if (tupleData[1] == month) {
                // Check to see if the day is after or within 7 days (a week in time series) close to the user's date
                if (tupleData[2] >= day || (day > tupleData[2] && (Math.abs(tupleData[2] - day) <= 7))) {
                    let temp = Math.abs((tupleData[2] / 7) - (day / 7));
                    if (temp < min) {
                        min = temp;
                        minIndex = i;
                    }
                }
            }
        }
    }
    // return the minimum difference index between the date the user provided and the closest match in the weekly series
    return minIndex;
}
// Finds the oldest possible API recorded entry of a particular stock. 
// For example, the earliest AAPL was recorded for Alpha Vantage was 1999 although
// the stock as been traded for many years before that date. Thus, we are working within
// the constraints of the API. 
// Returns: the oldest date entry (in API response) of a given security
function findOldestEntry(security) {
    // Grab the length of the security, and return the last index of the keys (dates)
    let securityLength = Object.keys(security).length;
    return Object.keys(security)[securityLength - 1];
}
/**
 * checks the status of the response
 * @param {Response} res - the response
 * @return {Promise<Response>} the response if it is valid and acceptable
 */
function statusCheck(res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!res.ok) {
            throw new Error(yield res.text());
        }
        return res;
    });
}
/**
 * Handles an error produced from trying to fetch any of the possible endpoints
 */
function handleErr() {
    console.log("there was an error, ruh roh!");
}
