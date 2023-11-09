(function() {
  window.addEventListener('load', init);
  // const APIkey = "TLUYLC7Y5VCCJC9A"; 
  const APIkey = "A5V08V16P0UGS8VY";

  let totalPortfolioValue = 0; 
  let customSellDateBool = false;
  let stockIteration = 0; 
  let moneyTracker = []; 
  let stockTracker = []; 
  let godCounter = 0; 
  let bigTech = ["MSFT", "AAPL", "AMZN", "GOOG", "NDAQ"];
  let bigSemi = ["NVDA", "NXPI", "AVGO", "SMH", "MU", "ADI"];

  // Personal Project Notes: 

  // Could make a stock rating system / timing system where it tells you the overall grade of the stock, 
  // (using how it ranks within its sector, ie is NVTS good compared to AVGO + NVDA? is AMZN good compared to MSFT, etc.)
  // What the predicted price in 3 months, 6 months, 1 year, etc. is (using past data and trends), 
  // and how much money will it be worth at that time in the future based upon what you put in it TODAY!

  // Could also do an analysis by sector, show how to make a balanced portfolio, allow the user to 
  // play around with the %'s by sector on performance, ie if they increase defense stocks from 10% to 15%, 
  // how does that change their overall outlook?

  function init() {
    document.getElementById('new_portfolio').addEventListener('click', buildNewPortfolio);
    document.getElementById('submission').addEventListener('click', function(el) {
      el.preventDefault();
      showStock();
    }); 
    document.getElementById('custom_sell_date').addEventListener('click', displayCustomSellDate); 
    document.getElementById('add_stock').addEventListener('click', function(el) {
      el.preventDefault(); 
      addNewStockInput('ticker', 'Stock:');
      addNewStockInput('amount', 'Amount:'); 
      addNewStockInput('date', 'Date:'); 
    })
  }

  // Builds a new portfolio and resets existing values when clicked
  function buildNewPortfolio() {
    totalPortfolioValue = 0;
    let newPort = document.querySelector('.new_port');
    newPort.style['display'] = 'block';
    let newBtn = document.querySelector('#new_portfolio');
    newBtn.style['display'] = 'none';
    document.getElementById('custom_sell_date').style.display = 'block';
    document.getElementById('date_invested').textContent = 'Date:';
    let divArray = document.querySelectorAll(".stock_input"); 
    for (let i = 0; i < divArray.length; i++) {
      let curr = divArray[i]; 
      // unhides each stock input field
      curr.style.display = "flex";
    }
    let add = document.getElementById("add_stock"); 
    add.style.display = "block";
    let sub = document.getElementById("submission"); 
    sub.style.display = "block";

    let innards = document.getElementById('portfolio_value'); 
    innards.innerHTML = ""; 

    // Cleans input and resets values back to ""
    let inputCleaner = document.querySelectorAll('input');  
    for (let i = 0; i < inputCleaner.length; i++) {
      if (inputCleaner[i].value != "") {
        inputCleaner[i].value = ""; 
      }
    }

  }

  // To be flushed out later
  function conductNewResearch() {
    document.querySelector('.new_port').style.display = 'block';
  }

  // Displays a custom sell date that the user provides, unhides
  // the necessary information for them to input 
  function displayCustomSellDate() {
    let sellDate = document.createElement('div'); 
    sellDate.classList.add('stock_input');
    let sellLabel = document.createElement('label');
    sellLabel.setAttribute('for', 'custom_sell_date');
    sellLabel.textContent = "Sell Date:";
    let sellInput = document.createElement('input');
    sellInput.classList.add('custom_date'); 
    sellInput.setAttribute('type', 'text'); 
    sellInput.setAttribute('placeholder', 'Enter date sold (ex: 2022-05-05)');
    sellInput.required = true; 
    sellDate.appendChild(sellLabel); 
    sellDate.appendChild(sellInput); 
    document.getElementById('stocks_container').appendChild(sellDate); 
    let buyStockText = document.getElementById("date_invested"); 
    buyStockText.textContent = "Date Invested:";
  }

  // Adds a new stock input element to stock container to display
  function addNewStockInput(value, displayedText) {
    let input = document.createElement('div'); 
    input.classList.add('stock_input');
    let inptLabel = document.createElement('label');
    inptLabel.for = value;
    inptLabel.textContent = displayedText; 
    input.appendChild(inptLabel);
    let actualInput = document.createElement('input');
    actualInput.type = 'text';
    actualInput.classList.add(value); 
    input.appendChild(actualInput); 
    let stockContainer = document.getElementById('stocks_container');
    stockContainer.appendChild(input);
  }

  // Makes a fetch call to grab a ticker symbols information, 
  // then calculates how good that stock is (subjective)
  function showStock() {
    let symbols = document.querySelectorAll(".ticker");
    for (let i = 0; i < symbols.length; i++) {
      stockTracker[i] = symbols[i].value; 
    }
    stockIteration = symbols.length - 1; 
    for (let i = stockIteration; i >= 0; i--) {
      let symbol = symbols[i].value; 
      let URL = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=" + symbol + "&apikey=" + APIkey;
      fetch(URL)
        .then(statusCheck)
        .then(res => res.json())
        .then(calculateStock)
        .catch(handleErr);
    }
  }

  // Calculates a stock price and corresponding info based upon what stock, 
  // when the user invested, and how much they put into the security / stock. 
  function calculateStock(response) {
    // Check if the user has supplied a custom sell date (ie not today's date as a selling date)
    if (document.getElementById('stocks_container').childElementCount === 4) {
      console.log("inside the right if/else cond")
      var updatedInfo = response['Weekly Adjusted Time Series'];
      customSellDateBool = true;

      // Grab the custom user's buy date information
      let userInvestedDate = document.getElementById("date_invested_field").value;
      console.log(userInvestedDate)
      userInvestedDate = userInvestedDate.split("-")
      let userInvestedYear = userInvestedDate[0];
      let userInvestedMonth = userInvestedDate[1];
      let userInvestedDay = userInvestedDate[2];

      // Use helper function to calculate the "best" meaning cloest possible day 
      // out of the API available weekly info to what the user inputted
      let indexDateInvested= findEntry(userInvestedYear, userInvestedMonth, userInvestedDay, response);
      console.log(indexDateInvested)

      // Grab the custom sell information
      let customSellDate = document.querySelector('.custom_date').value; 
      let sellDateArray = customSellDate.split("-");
      let customSellYear = sellDateArray[0];
      let customSellMonth = sellDateArray[1];
      let customSellDay = sellDateArray[2];

      let indexDateSold= findEntry(customSellYear, customSellMonth, customSellDay, response);

      console.log("past index date sold")

      // Grab corresponding amounts to determine price / value
      let adjClose = updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]['5. adjusted close'];
      let amounts = document.querySelectorAll('.amount');
      let startMoney = amounts[stockIteration].value;
      let symbols = document.querySelectorAll('.ticker'); 
      let symbol = symbols[stockIteration].value;
      let marketPrice = updatedInfo[Object.keys(updatedInfo)[indexDateSold]]['5. adjusted close'];
      
      let investmentValue = ((startMoney / adjClose) * marketPrice);
      totalPortfolioValue += investmentValue; 
      stockTracker[godCounter] = response['Meta Data']['2. Symbol']; 
      moneyTracker[godCounter] = investmentValue;
      godCounter++; 

      investmentValue = investmentValue.toFixed(2); 
      console.log(investmentValue); 

      stockIteration = stockIteration - 1; 
      if (stockIteration === -1) {
        let divArray = document.querySelectorAll(".stock_input"); 
        let totalP = document.createElement('p');
        let finalPortValue = totalPortfolioValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

        totalP.textContent = "Your investment would be worth roughly: $" + finalPortValue + " in today's market..."; 
        for (let i = 0; i < divArray.length; i++) {
          let curr = divArray[i]; 
          curr.style.display = "none";
        }
        document.getElementById('portfolio_value').appendChild(totalP);
        let newSymbols = document.querySelectorAll('.ticker'); 

        for (let i = 0; i < stockTracker.length; i++) {
          let newStockInfo = document.createElement('p'); 
          let pArray = document.querySelectorAll('.removable'); 
          for (let i = 0; i < pArray.length; i++) {
            pArray[i].classList.add("remove"); 
          }
          newStockInfo.classList.add('removable');
          newStockInfo.textContent = "Your investment in " + stockTracker[i] + " would be worth  roughly $" + 
            moneyTracker[i].toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
          document.getElementById('portfolio_value').appendChild(newStockInfo);
        }

        let newBtn = document.querySelector('#new_portfolio');
        newBtn.style['display'] = 'block';
        document.getElementById('add_stock').style.display = "none";
        document.getElementById('submission').style.display = "none";
        document.getElementById('custom_sell_date').style.display = "none";
      }
    } else {
      // let minIndex = calculateBestReturnedDay(response, "buy_date");
      var updatedInfo = response['Weekly Adjusted Time Series'];

      // let adjClose = updatedInfo[Object.keys(updatedInfo)[minIndex]]['5. adjusted close'];
      // Calculate the index of the date that the user invested in the response object
      let userInvestedDate = document.getElementById("date_invested_field").value;
      userInvestedDate = userInvestedDate.split("-")
      let userInvestedYear = userInvestedDate[0];
      let userInvestedMonth = userInvestedDate[1];
      let userInvestedDay = userInvestedDate[2];

      let indexDateInvested= findEntry(userInvestedYear, userInvestedMonth, userInvestedDay, response);
      userAdjCloseInvested = updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]['5. adjusted close'];
      console.log(updatedInfo[Object.keys(updatedInfo)[indexDateInvested]])
      console.log(updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]['5. adjusted close'])

      let amounts = document.querySelectorAll('.amount');
      let startMoney = amounts[stockIteration].value; 
      let symbols = document.querySelectorAll('.ticker'); 
      let symbol = symbols[stockIteration].value;
      let marketPrice = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'];
      console.log("Market Price: ")
      console.log(marketPrice)
      let investmentValue = ((startMoney / userAdjCloseInvested) * marketPrice);
      totalPortfolioValue += investmentValue; 
          
      stockTracker[godCounter] = response['Meta Data']['2. Symbol']; 
      moneyTracker[godCounter] = investmentValue;
      godCounter++; 

      // Fix to two decimal points
      investmentValue = investmentValue.toFixed(2); 

      stockIteration = stockIteration - 1; 
      if (stockIteration === -1) {
        
        let divArray = document.querySelectorAll(".stock_input"); 
        let totalP = document.createElement('p');
        let finalPortValue = totalPortfolioValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

        totalP.textContent = "Your investment would be worth roughly: $" + finalPortValue + " in today's market..."; 
        for (let i = 0; i < divArray.length; i++) {
          let curr = divArray[i]; 
          curr.style.display = "none";
        }
        document.getElementById('portfolio_value').appendChild(totalP);
        let newSymbols = document.querySelectorAll('.ticker'); 

        for (let i = 0; i < stockTracker.length; i++) {
          let newStockInfo = document.createElement('p'); 
          let pArray = document.querySelectorAll('.removable'); 
          for (let i = 0; i < pArray.length; i++) {
            pArray[i].classList.add("remove"); 
          }
          newStockInfo.classList.add('removable');
          newStockInfo.textContent = "Your investment in " + stockTracker[i] + 
            " would be worth  roughly $" + moneyTracker[i].toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
          document.getElementById('portfolio_value').appendChild(newStockInfo);
        }

        let newBtn = document.querySelector('#new_portfolio');
        newBtn.style['display'] = 'block';
        document.getElementById('add_stock').style.display = "none";
        document.getElementById('submission').style.display = "none";
        document.getElementById('custom_sell_date').style.display = "none";
      }
    }
  }

  // Finds the closest entry in the API week list based upon 
    // a provided year, month, and date. Returns the index of the week which 
    // is cloest to the provided year, month and day input. 
    function findEntry(year, month, day, response) {
      console.log("Trying to find you an entry")
      console.log(year)
      console.log(month)
      console.log(day)
      console.log(response)
      var updatedInfo = response['Weekly Adjusted Time Series'];
      let length = Object.keys(updatedInfo).length
      let minIndex = 0;
      let min = 100000;
      let validData = false; // NOTE: UPDATE THIS TO INCLUDE IF THEY GO TOO EARLY LATER
      for (let i = 0; i < length; i++) {
        let tuple = Object.keys(updatedInfo)[i];
        console.log(tuple)
        tupleData = tuple.split('-');
        if (tupleData[0] == year) {
          if (tupleData[1] == month) {
            console.log("Match on")
            console.log(tupleData)
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
      console.log("Successfully found you an entry")
      // return the minimum difference index between the date the user provided and the closest match in the weekly series
      return minIndex; 
    }

  // // Calculates the best week to select based upon the user's inputted date
  // function calculateBestReturnedDay(response, date) {
  //   let dates; 
  //   let symbolizer = document.querySelectorAll(".ticker");
  //   if (date == "buy_date") {
  //     dates = document.querySelector(".date").value; 
  //   } else {
  //     dates = document.querySelector('.custom_date').value; 
  //   }
  //   let dateArray = dates.split('-');
  //   let year = dateArray[0];
  //   let month = dateArray[1];
  //   let day = dateArray[2];
  //   var updatedInfo = response['Weekly Adjusted Time Series'];
  //   let length = Object.keys(updatedInfo).length;
  //   let minIndex = 0;
  //   let min = 100000;
  //   let validData = false; // NOTE: UPDATE THIS LATER TO INCLUDE IF THEY GO TOO EARLY
  //   for (let i = 0; i < length; i++) {
  //     let tuple = Object.keys(updatedInfo)[i]; 
  //     tupleData = tuple.split('-');
  //     if (tupleData[0] == year) {
  //       if (tupleData[1] == month) {
  //         if (tupleData[2] >= day) {
  //           let temp = Math.abs((tupleData[2] / 7) - (day / 7));
  //           if (temp < min) {
  //           min = temp;
  //           minIndex = i; 
  //           }
  //         }
  //       }
  //     }
  //   }
  //   // return the minimum difference index between the date the user provided and the closest match in the weekly series
  //   return minIndex; 
  // }


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