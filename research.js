(function() {
  window.addEventListener('load', init);
  const APIkey = "A5V08V16P0UGS8VY"  
  // "TLUYLC7Y5VCCJC9A"
  let totalPortfolioValue = 0; 
  let stockIteration = 0; 
  let moneyTracker = []; 
  let stockTracker = []; 
  let godCounter = 0; 
  let globalYTDTrack = 0;
  let globalStockRes;
  let globalSPRes;
  let ticker; 
  let bigTech = ["MSFT", "AAPL", "GOOG", "NDAQ"]
  let bigSemi = ["NVDA", "AVGO", "SMH", "ADI"]

  // Testing 

  // Personal Project Notes:

  // Could make a stock rating system / timing system where it tells you the overall grade of the stock, 
  // (using how it ranks within its sector, ie is NVTS good compared to AVGO + NVDA? is AMZN good compared to MSFT, etc.)
  // What the predicted price in 3 months, 6 months, 1 year, etc. is (using past data and trends), 
  // and how much money will it be worth at that time in the future based upon what you put in it TODAY!

  // Could also do an analysis by sector, show how to make a balanced portfolio, allow the user to 
  // play around with the %'s by sector on performance, ie if they increase defense stocks from 10% to 15%, 
  // how does that change their overall outlook? 

  // Could show how money compares to investments like CDs, high-yield bank accounts, inflation, etc. 
  
  function init() {
    document.getElementById('new_research').addEventListener('click', conductNewResearch); 
    document.getElementById('submission_research').addEventListener('click', function(el) {
      el.preventDefault();
      doResearch(); 
    }); 
  }

  // Changes views to show conduct new research
  function conductNewResearch() {
    document.querySelector('.new_port').style.display = 'block';
    document.querySelector('#new_research').style.display = 'none';
  }

  // Does research on a specific stock / security ticker provided by the user
  // Pulls up the yield information, compares the security to others within its sector
  // And shows graphically how much money the user could have made, and how they 
  // can utilize that info to make more money in the future from investing... hence Fortune Teller
  function doResearch() {
      ticker = document.getElementById("research_stock_ticker").value;
      let URL = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=" + ticker + "&apikey=" + APIkey;
      fetch(URL)
        .then(statusCheck)
        .then(res => res.json())
        .then(calculateResearch)
        .catch(handleErr);
  }

  // Calculates a stock / security price and corresponding info based upon what stock, 
  // when the user invested, and how much they put into the security / stock.
  function calculateResearch(res) {
      globalStockRes = res;
      var updatedInfo = res['Weekly Adjusted Time Series'];
      ticker = ticker.toLowerCase();
      let length = Object.keys(updatedInfo).length;
      let newGraphBackground = document.createElement('img'); 
      newGraphBackground.src = "https://media.istockphoto.com/id/1341800395/vector/grid-paper-mathematical-graph-cartesian-coordinate-system-with-x-axis-y-axis-squared.jpg?s=612x612&w=0&k=20&c=Jcq_YJw1cEufocBwcUu9N1BxXErtlYSr3FLYFyFFKAM=";
      newGraphBackground.onload = function () {
        // Set up the graph of API weeks and initialize pre-sets 
        let pixelDistanceWidth = (((newGraphBackground.x + 452) -  (newGraphBackground.x + 24)) / (length))
        let firstEverAdjClose = updatedInfo[Object.keys(updatedInfo)[length - 1]]['5. adjusted close'];

        // Create a height scaling score to adjust the vertical distance between dots depending 
        // on how much the stock price has increased over its lifetime. Automatically adjusts 
        // depending on how good / bad of a run a stock has had. 
        let heightScaleScore = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'] / updatedInfo[Object.keys(updatedInfo)[length - 1]]['5. adjusted close'];
        let biggestAdjCloseEverSeenForStock = 0; 
        let lowestAdjCloseEverSeenForStock = 10000000000;
        let kingCount = 1; 
        for (let i = 0; i < length; i++) {
          let dot = document.createElement('span');
          dot.addEventListener('mouseover', function() {
            let dotDate = document.createElement('p');
            dotDate.textContent = Object.keys(updatedInfo)[i];
            dotDate.id = 'dot#' + dot.id;
            dotDate.classList.add('dot_label');
            dotDate.style.left = 485 + 0 + ((length - i) * pixelDistanceWidth) + "px"; 
            // dotDate.style.left = 24 + i * pixelDistanceWidth + "px"; // GPT
            dotDate.style.top = 775 - ((300 / heightScaleScore) * (adjustedCurrentClose / firstEverAdjClose)) + "px"; 
            document.getElementById('graph').appendChild(dotDate);
          });

          dot.addEventListener('mouseout', function() {
            currDot = document.getElementById('dot#' + dot.id);
            document.getElementById('graph').removeChild(currDot);
          })

          dot.classList.add('dot');
          document.getElementById('graph').appendChild(dot);
          dot.style.left = 485 + ((length - i) * pixelDistanceWidth) + "px"; 
          // dot.style.left = 24 + i * pixelDistanceWidth + "px"; // GPT
          let adjustedCurrentClose = updatedInfo[Object.keys(updatedInfo)[i]]['5. adjusted close'];

          if (adjustedCurrentClose >= biggestAdjCloseEverSeenForStock) {
            biggestAdjCloseEverSeenForStock = adjustedCurrentClose;
          }

          if (adjustedCurrentClose <= lowestAdjCloseEverSeenForStock) {
            lowestAdjCloseEverSeenForStock = adjustedCurrentClose;
          }

          if (i == 0 || (i % Math.floor((length - 1) / 4) == 0)) {
            let label = document.createElement('span');
            label.textContent = (Object.keys(updatedInfo)[i]).toString().split("-")[0];
            label.classList.add('x_axis_label');
            label.style.top = 850 + "px"; 
            // label.style.right = 650 + (103 * kingCount) + "px";
            label.style.right = 500 + i * pixelDistanceWidth + "px"; // GPT
            kingCount++;
            document.getElementById('graph').appendChild(label);
          }
          dot.style.top = 825 - ((300 / heightScaleScore) * (adjustedCurrentClose / firstEverAdjClose)) + "px"; 
        }

        let mostRecentClose = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'];
        let dotArray = document.querySelectorAll('.dot');
        if (parseInt(firstEverAdjClose) < parseInt(mostRecentClose)) {
          dotArray = document.querySelectorAll('.dot');
          for (let z = 0; z < dotArray.length; z++) {
            dotArray[z].style['background-color'] = 'green';
          }
        } else {
          for (let z = 0; z < dotArray.length; z++) {
            dotArray[z].style['background-color'] = 'red';
          }
        }
      };
      document.getElementById('graph').appendChild(newGraphBackground);
      
      calculateMomentum(res);
  }

  function calculateMomentum(res) {
    var updatedInfo = res['Weekly Adjusted Time Series'];
    // Grab the current date that the user searched on (today's date)
    let currDate = Object.keys(updatedInfo)[0];
    let dateArray = currDate.split('-');
    let currYear = dateArray[0];
    let currMonth = dateArray[1];
    let currDay = dateArray[2];

    let tenOldYear = currYear - 10;
    let fiveOldYear = currYear - 5;
    let twoOldYear = currYear - 2;
    let oneOldYear = currYear - 1;
    var updatedInfo = res['Weekly Adjusted Time Series'];

    // Finds the closest entry to the respective date (in this case 10 years ago from when the user searched)
    // and returns the corresponding index to be used in calculating the return based upon that yield
    indexTen = findEntry(tenOldYear, currMonth, currDay, res);
    tenYearAdjClose = updatedInfo[Object.keys(updatedInfo)[indexTen]]['5. adjusted close'];

    indexFive = findEntry(fiveOldYear, currMonth, currDay, res);
    fiveYearAdjClose = updatedInfo[Object.keys(updatedInfo)[indexFive]]['5. adjusted close'];

    indexStart = findEntry(2020, 9, 21, res);
    startAdjClose = updatedInfo[Object.keys(updatedInfo)[indexStart]]['5. adjusted close'];

    indexTwo = findEntry(twoOldYear, currMonth, currDay, res);
    twoYearAdjClose = updatedInfo[Object.keys(updatedInfo)[indexTwo]]['5. adjusted close'];

    indexOne = findEntry(oneOldYear, currMonth, currDay, res);
    oneYearAdjClose = updatedInfo[Object.keys(updatedInfo)[indexOne]]['5. adjusted close'];

    indexYTD = findEntry(currYear, 1, 1, res);
    YTDAdjClose = updatedInfo[Object.keys(updatedInfo)[indexYTD]]['5. adjusted close'];

    // The market price of what the security is currently going for on the stock market
    let marketPrice = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'];
    // Initial investment is set using 10000 standard
    let initialInvestment = 10000;




    // // Dynamically create a scaler that allows user to adjust their initial amount
    // let initialInvestmentContainer = document.createElement('div');
    // initialInvestmentContainer.classList.add("slider-container");
    // let investmentLabel = document.createElement('label');
    // investmentLabel.for = "invest_slider";
    // let investmentInput = document.createElement('input');
    // investmentInput.id = "slider";
    // investmentInput.type = "range";
    // investmentInput.min = "1000";
    // investmentInput.max = "100000";
    // // investmentInput.value = "10000";
    // investmentInput.step = 1000;
    // initialInvestmentContainer.textContent = "Choose your initial investment amount:";
    // let investmentText = document.createElement('p');
    // investmentText.textContent = "Investing: $" + initialInvestment;
    // initialInvestmentContainer.appendChild(investmentLabel);
    // initialInvestmentContainer.appendChild(investmentInput);
    // initialInvestmentContainer.appendChild(investmentText);
    // investmentInput.addEventListener('input', function() {
    //   investmentText.textContent = "Investing: $" + investmentInput.value;
    //   initialInvestment = investmentInput.value;
    //   // clear out previous content
    //   document.getElementById('momentum').innerHTML = "";
    //   displayYieldValues(initialInvestment, tenYearAdjClose, fiveYearAdjClose, twoYearAdjClose, startAdjClose, oneYearAdjClose, YTDAdjClose, marketPrice);
    // })
    // // Add class to display visual styling and scaling capabilities
    // document.getElementById('momentum_slider').appendChild(initialInvestmentContainer);









      // Dynamically create a scaler that allows the user to adjust their initial amount
      let initialInvestmentContainer = document.createElement('div');
      initialInvestmentContainer.classList.add("slider-container");
      let investmentLabel = document.createElement('label');
      investmentLabel.for = "invest_slider";
      let investmentInput = document.createElement('input');
      investmentInput.id = "slider";
      investmentInput.type = "range";
      investmentInput.min = "1000";
      investmentInput.max = "100000";
      investmentInput.value = "10000";
      investmentInput.step = 1000;

      initialInvestmentContainer.textContent = "Choose your initial investment amount:";
      let investmentText = document.createElement('p');
      investmentText.textContent = "Investing: $" + initialInvestment;

      initialInvestmentContainer.appendChild(investmentLabel);
      initialInvestmentContainer.appendChild(investmentInput);
      initialInvestmentContainer.appendChild(investmentText);

      investmentInput.addEventListener('input', function() {
      investmentText.textContent = "Investing: $" + investmentInput.value;
      initialInvestment = investmentInput.value;
      // clear out previous content
      document.getElementById('momentum').innerHTML = "";
      displayYieldValues(initialInvestment, tenYearAdjClose, fiveYearAdjClose, twoYearAdjClose, startAdjClose, oneYearAdjClose, YTDAdjClose, marketPrice);
      });
      // Add class to display visual styling and scaling capabilities
      document.getElementById('momentum_slider').appendChild(initialInvestmentContainer);










    displayYieldValues(initialInvestment, tenYearAdjClose, fiveYearAdjClose, twoYearAdjClose, startAdjClose, oneYearAdjClose, YTDAdjClose, marketPrice);
    

    let YTDValue = document.createElement('p');
    globalYTDTrack = ((10000 / YTDAdjClose) * marketPrice);
    calculateSP500Rating(((10000 / YTDAdjClose) * marketPrice));
    YTDValue.textContent = "Your investment's YTD yield would be: " + investmentValueYTDLater.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('momentum').appendChild(YTDValue);
  }

  // Bulk function to display all of the yields tenYear to YTD.
  function displayYieldValues(initialInvestment, tenYearAdjClose, fiveYearAdjClose, twoYearAdjClose, startAdjClose, oneYearAdjClose, YTDAdjClose, marketPrice) {
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
    tenRatingScore = stockRatingTenYrYield(((10000 / tenYearAdjClose) * marketPrice));
    tenValue.textContent = "Your investment's 10-year yield would be: " + investmentValueTenYearsLater.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    tenRating.textContent = "Your investment's 10-year yield is rated at: " + tenRatingScore;
    document.getElementById('momentum').appendChild(tenValue);
    document.getElementById('momentum').appendChild(tenRating);

    let fiveValue = document.createElement('p');
    let fiveRating = document.createElement('p');
    fiveRatingScore = stockRatingFiveYrYield(((10000 / fiveYearAdjClose) * marketPrice));
    fiveValue.textContent = "Your investment's 5-year yield would be: " + investmentValueFiveYearsLater.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    fiveRating.textContent = "Your investment's 5-year yield is rated at: " + fiveRatingScore;
    document.getElementById('momentum').appendChild(fiveValue);
    document.getElementById('momentum').appendChild(fiveRating);

    let startValue = document.createElement('p');
    startValue.textContent = "Your investment's yield since Elias' start (9/21/20) would be: " + investmentValueStartLater.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('momentum').appendChild(startValue);

    let twoValue = document.createElement('p');
    twoValue.textContent = "Your investment's 2-year yield would be: " + investmentValueTwoYearsLater.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('momentum').appendChild(twoValue);

    let oneValue = document.createElement('p');
    oneValue.textContent = "Your investment's 1-year yield would be: " + investmentValueOneYearLater.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('momentum').appendChild(oneValue);
  }

  // "Grades" the stock based upon how much the investment grew to from an 
  // initial $10,000 investment over 10 years. 
  // NOTE: This is subjective and my personal rating system based upon 
  // researching and being involved in the stock market for four years and counting
  // Returns: A numeric letter rating of how the security did over the given period
  function stockRatingTenYrYield(yieldValue) {
    let TenYearYieldRating; 
    if (yieldValue >= 150000) {
      TenYearYieldRating = "A+";
    } else if (yieldValue >= 100000) {
      TenYearYieldRating = "A";
    } else if (yieldValue >= 90000) {
      TenYearYieldRating = "A-";
    } else if (yieldValue >= 80000) {
      TenYearYieldRating = "B+";
    } else if (yieldValue >= 70000) {
      TenYearYieldRating = "B";
    } else if (yieldValue >= 60000) {
      TenYearYieldRating = "B-";
    } else if (yieldValue >= 50000) {
      TenYearYieldRating = "C+";
    } else if (yieldValue >= 40000) {
      TenYearYieldRating = "C";
    } else if (yieldValue >= 30000) {
      TenYearYieldRating = "C-";
    } else if (yieldValue >= 20000) {
      TenYearYieldRating = "D";
    } else if (yieldValue >= 10000) {
      TenYearYieldRating = "D-";
    } else {
      TenYearYieldRating = "F";
    }
    return TenYearYieldRating;
  }

  // "Grades" the stock based upon how much the investment grew to from an 
  // initial $10,000 investment over four years. 
  // NOTE: This is subjective and my personal rating system based upon 
  // researching and being involved in the stock market for four years and counting
  // Returns: A numeric letter rating of how the security did over the given period
  function stockRatingFiveYrYield(yieldValue) {
    let FiveYearYieldRating; 
    if (yieldValue >= 32500) {
      FiveYearYieldRating = "A+";
    } else if (yieldValue >= 20000) {
      FiveYearYieldRating = "A";
    } else if (yieldValue >= 17500) {
      FiveYearYieldRating = "A-";
    } else if (yieldValue >= 15000) {
      FiveYearYieldRating = "B";
    } else if (yieldValue >= 10000) {
      FiveYearYieldRating = "C";
    } else if (10000 > yieldValue >= 7500) {
      FiveYearYieldRating = "D";
    } else {
      FiveYearYieldRating = "F";
    }
    return FiveYearYieldRating;
  }

  // Calculates the SP500 Rating (using as a measurable standard to compare a security against)
  // NOTE: "VOO" represents Vanguard's particular S&P500 security tracker, but this is an arbitrary selection
  // In the personal finance / brokerage community, people generally tend to lean towards Vanguard for mutual funds / etfs, 
  // hence this is used as the standard to compare against here.
  function calculateSP500Rating(stockYTD) {
    let URL = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=" + "VOO" + "&apikey=" + APIkey;
    fetch(URL)
      .then(statusCheck)
      .then(res => res.json())
      .then(SP500YTD)
      .catch(handleErr);
  }

  // Tracks how much the security has grew since the YTD (January 1st of the current year)
  // Assumes that the security should be outperforming the S&P500 in order to receive 
  // a positive rating, and hence is simply a measurement to be compared 
  // with other tools to determine a security's actual value or investment worth.
  function SP500YTD(res) {
    globalSPRes = res;
    var updatedInfo = res['Weekly Adjusted Time Series'];
    let marketPrice500 = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'];
    let YTDAdjClose500 = updatedInfo[Object.keys(updatedInfo)[indexYTD]]['5. adjusted close'];
    let investmentValue500YTDLater = ((10000 / YTDAdjClose500) * marketPrice500);
    let SP500Rating;
    if (globalYTDTrack >= (investmentValue500YTDLater * 1.2)) {
      SP500Rating = "A"
    } else if (globalYTDTrack >= (investmentValue500YTDLater * 1.1)) {
      SP500Rating = "B"
    } else if (globalYTDTrack >= (investmentValue500YTDLater * 1.025)) {
      SP500Rating = "B-"
    } else if ((investmentValue500YTDLater * 0.975) <= globalYTDTrack < (investmentValue500YTDLater * 1.025)) {
      SP500Rating = "C"
    } else if (globalYTDTrack < (investmentValue500YTDLater * 0.975)) {
      SP500Rating = "C-"
    } else if (globalYTDTrack < (investmentValue500YTDLater * 0.95)) {
      SP500Rating = "D"
    } else if (globalYTDTrack < (investmentValue500YTDLater * 0.90)) {
      SP500Rating = "F"
    }
    let SP500Txt = document.createElement('p');
    SP500Txt.textContent = "Your investment's YTD-yield vs. the S&P500 is rated at: " + SP500Rating;
    document.getElementById('momentum').appendChild(SP500Txt);
    console.log("about to call new function VSSP500");
    calculatePerformanceVSSP500(res);
  }

  // Calculates how many years the stock has outperformed the S&P500, 
  // and creates a detailed report with which exact years it outperformed the S&P500 in terms of yield
  // Only starts looking at the earliest year the stock being research was on the market for valid comparison. 
  function calculatePerformanceVSSP500(res) {
    let updatedStockInfo = globalStockRes['Weekly Adjusted Time Series'];
    let updatedSPInfo = globalSPRes['Weekly Adjusted Time Series'];
    console.log("stock res below")
    console.log(globalStockRes)
    let oldestStockDate = findOldestEntry(globalStockRes['Weekly Adjusted Time Series']);
    console.log("oldestStockDate");
    console.log(oldestStockDate);
    let parsedStockDate = oldestStockDate.split("-")
    let startingStockYear = parsedStockDate[0];
    startingStockYear = parseInt(startingStockYear);
    console.log(startingStockYear);
    // Take the next year after the earliest stock year to have a guaranteed January start to the year
    console.log(parseInt(startingStockYear) + 1)

    console.log("SP res below")
    console.log(globalSPRes)
    let oldestSPDate = findOldestEntry(globalSPRes['Weekly Adjusted Time Series']);
    console.log("oldestSPDate");
    console.log(oldestSPDate);
    let parsedSPDate = oldestSPDate.split("-")
    let startingSPYear = parsedSPDate[0];
    startingSPYear = parseInt(startingSPYear);
    console.log(startingSPYear);

    // Ultimately convert this into a for loop to go until the year less than the current year (we have our current year YTD for that)

    // Set the universal stock year to be the latest possible year (max) between the two securities
    let universalStartYear = Math.max(startingSPYear, startingStockYear);
    universalStartYear = parseInt(universalStartYear);
    let universalEndYearDate = Object.keys(globalStockRes['Weekly Adjusted Time Series'])[0];
    console.log(universalEndYearDate)
    let universalEndYearArray = universalEndYearDate.split("-")
    let universalEndYear = universalEndYearArray[0]
    universalEndYear = parseInt(universalEndYear);
    console.log(universalStartYear)
    console.log(universalEndYear)
    // Stop 2 years earlier than current year to ensure that YTD extends to proper range
    for (let currYear = universalStartYear; currYear < universalEndYear - 1; currYear++) {
      console.log("inside of for loop for start/end year calcs")
      let januaryStockIndex = findEntry(currYear + 1, 1, 1, globalStockRes);
      // Insert 1 year gap to simulate YTD calulcation
      let nextJanuaryStockIndex = findEntry(currYear + 2, 1, 1, globalStockRes);
      let januaryStockAdj = updatedStockInfo[Object.keys(updatedStockInfo)[januaryStockIndex]]['5. adjusted close'];
      let nextJanuaryStockAdj = updatedStockInfo[Object.keys(updatedStockInfo)[nextJanuaryStockIndex]]['5. adjusted close'];
      console.log(januaryStockAdj)
      console.log(nextJanuaryStockAdj)

      let januarySPIndex = findEntry(currYear + 1, 1, 1, globalSPRes);
      let nextJanuarySPIndex = findEntry(currYear + 2, 1, 1, globalSPRes);
      let januarySPAdj = updatedSPInfo[Object.keys(updatedSPInfo)[januarySPIndex]]['5. adjusted close'];
      let nextJanuarySPAdj = updatedSPInfo[Object.keys(updatedSPInfo)[nextJanuarySPIndex]]['5. adjusted close'];
      console.log(januarySPAdj)
      console.log(nextJanuarySPAdj)

      if (nextJanuarySPAdj / januarySPAdj > nextJanuaryStockAdj / januaryStockAdj) {
        console.log("SP500 exceed stock for year:")
        console.log(currYear)
        console.log("to")
        console.log(parseInt(currYear + 1))
      } else {
        console.log("Stock exceed SP500 for year:")
        console.log(currYear)
        console.log("to")
        console.log(parseInt(currYear + 1))
      }
    }
   
    



    // then parse out oldestStockDate to send it into findEntry to find the corresponding date in S&P500 for comparison
    // findEntry();
  }

  // Finds the closest entry in the API week list based upon 
  // a provided year, month, and date. Returns the index of the week which 
  // is cloest to the provided year, month and day input. 
  // Returns: The closest index (entry) in API response to the given date the user is requesting 
  function findEntry(year, month, day, response) {
    console.log("Inside of findEntry")
    console.log("Here was my response")
    console.log(response)
    var updatedInfo = response['Weekly Adjusted Time Series'];
    console.log("updated info")
    console.log(updatedInfo)
    let length = Object.keys(updatedInfo).length
    let minIndex = 0;
    let min = 100000;
    for (let i = 0; i < length; i++) {
      let tuple = Object.keys(updatedInfo)[i]; 
      tupleData = tuple.split('-');
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
   * @param {DOMList} res - the response 
   * @return {object} the response if it is valid and acceptable
   */
   async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Handles an error produced from trying to fetch any of the possible endpoints
   */
   function handleErr() {
      console.log("there was an error, ruh roh!");
   }

})();