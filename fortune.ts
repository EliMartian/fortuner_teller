window.addEventListener('load', init);
const APIkey: string = "WJ2S8Y8BM204TYD6";

let totalPortfolioValue: number = 0;
let customSellDateBool: boolean = false;
let stockIteration: number = 0;
let moneyTracker: number[] = [];
let stockTracker: string[] = [];
let godCounter: number = 0;

function init(): void {
  document.getElementById('new_portfolio')!.addEventListener('click', buildNewPortfolio);
  document.getElementById('submission')!.addEventListener('click', function(el) {
    el.preventDefault();
    showStock();
  });
  document.getElementById('custom_sell_date')!.addEventListener('click', displayCustomSellDate);
  document.getElementById('add_stock')!.addEventListener('click', function(el) {
    el.preventDefault();
    addNewStockInput('ticker', 'Stock:');
    addNewStockInput('amount', 'Amount:');
    addNewStockInput('date', 'Date:');
  });
}

function buildNewPortfolio(): void {
  totalPortfolioValue = 0;
  let newPort = document.querySelector('.new_port') as HTMLElement;
  newPort.style['display'] = 'block';
  let newBtn = document.querySelector('#new_portfolio') as HTMLElement;
  newBtn.style['display'] = 'none';
  document.getElementById('custom_sell_date')!.style.display = 'block';
  document.getElementById('date_invested')!.textContent = 'Date:';
  let divArray = document.querySelectorAll(".stock_input");
  for (let i = 0; i < divArray.length; i++) {
    let curr = divArray[i] as HTMLElement;
    curr.style.display = "flex";
  }
  let add = document.getElementById("add_stock")!;
  add.style.display = "block";
  let sub = document.getElementById("submission")!;
  sub.style.display = "block";

  let innards = document.getElementById('portfolio_value')!;
  innards.innerHTML = "";

  let inputCleaner = document.querySelectorAll('input');
  for (let i = 0; i < inputCleaner.length; i++) {
    if (inputCleaner[i].value != "") {
      inputCleaner[i].value = "";
    }
  }
}

function displayCustomSellDate(): void {
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
  document.getElementById('stocks_container')!.appendChild(sellDate);
  let buyStockText = document.getElementById("date_invested")!;
  buyStockText.textContent = "Date Invested:";
}

function addNewStockInput(value: string, displayedText: string): void {
  let input = document.createElement('div');
  input.classList.add('stock_input');
  let inptLabel = document.createElement('label');
  inptLabel.htmlFor = value;
  inptLabel.textContent = displayedText;
  input.appendChild(inptLabel);
  let actualInput = document.createElement('input');
  actualInput.type = 'text';
  actualInput.classList.add(value);
  input.appendChild(actualInput);
  let stockContainer = document.getElementById('stocks_container')!;
  stockContainer.appendChild(input);
}

function showStock(): void {
  let symbols = document.querySelectorAll(".ticker");
  for (let i = 0; i < symbols.length; i++) {
    const inputElement = symbols[i] as HTMLInputElement;
    stockTracker[i] = inputElement.value;
  }
  stockIteration = symbols.length - 1;
  for (let i = stockIteration; i >= 0; i--) {
    const inputElement = symbols[i] as HTMLInputElement;
    let symbol = inputElement.value;
    let URL = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=" + symbol + "&apikey=" + APIkey;
    fetch(URL)
      .then(statusCheck)
      .then(res => res.json())
      .then(calculateStock)
      .catch(handleErr);
  }
}

function calculateStock(response: any): void {
  console.log("res");
  console.log(response);

  if (document.getElementById('stocks_container')!.childElementCount === 4) {
    console.log("inside the right if/else cond");
    const updatedInfo = response['Weekly Adjusted Time Series'];
    customSellDateBool = true;

    let userInvestedDateValue = (document.getElementById("date_invested_field") as HTMLInputElement).value;
    let userInvestedDate: string[] = userInvestedDateValue.split("-");
    const userInvestedYear = userInvestedDate[0];
    const userInvestedMonth = userInvestedDate[1];
    const userInvestedDay = userInvestedDate[2];

    let indexDateInvested = findEntry(userInvestedYear, userInvestedMonth, userInvestedDay, response);
    console.log(indexDateInvested);

    let customSellDate = (document.querySelector('.custom_date') as HTMLInputElement).value;
    let sellDateArray = customSellDate.split("-");
    const customSellYear = sellDateArray[0];
    const customSellMonth = sellDateArray[1];
    const customSellDay = sellDateArray[2];

    let indexDateSold = findEntry(customSellYear, customSellMonth, customSellDay, response);
    console.log("past index date sold");

    let adjClose = updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]['5. adjusted close'];
    let amounts = document.querySelectorAll('.amount');
    let startMoney = (amounts[stockIteration] as HTMLInputElement).value;
    let symbols = document.querySelectorAll('.ticker');
    let symbol = (symbols[stockIteration] as HTMLInputElement).value;
    let marketPrice = updatedInfo[Object.keys(updatedInfo)[indexDateSold]]['5. adjusted close'];

    let investmentValue = ((parseFloat(startMoney) / parseFloat(adjClose)) * parseFloat(marketPrice));
    totalPortfolioValue += investmentValue;
    stockTracker[godCounter] = response['Meta Data']['2. Symbol'];
    moneyTracker[godCounter] = investmentValue;
    godCounter++;

    // investmentValue = investmentValue.toFixed(2);
    // console.log(investmentValue);

    stockIteration = stockIteration - 1;
    if (stockIteration === -1) {
      let divArray = document.querySelectorAll(".stock_input");
      let totalP = document.createElement('p');
      let finalPortValue = totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      totalP.textContent = "Your investment would be worth roughly: $" + finalPortValue + " in today's market...";
      for (let i = 0; i < divArray.length; i++) {
        let curr = divArray[i] as HTMLElement;
        curr.style.display = "none";
      }
      document.getElementById('portfolio_value')!.appendChild(totalP);
      let newSymbols = document.querySelectorAll('.ticker');

      for (let i = 0; i < stockTracker.length; i++) {
        let newStockInfo = document.createElement('p');
        let pArray = document.querySelectorAll('.removable');
        for (let i = 0; i < pArray.length; i++) {
          pArray[i].classList.add("remove");
        }
        newStockInfo.classList.add('removable');
        newStockInfo.textContent = "Your investment in " + stockTracker[i] +
          " would be worth  roughly $" + moneyTracker[i].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('portfolio_value')!.appendChild(newStockInfo);
      }

      let newBtn = document.querySelector('#new_portfolio');
      (newBtn as HTMLElement).style.display = 'block';
      document.getElementById('add_stock')!.style.display = "none";
      document.getElementById('submission')!.style.display = "none";
      document.getElementById('custom_sell_date')!.style.display = "none";
    }
  } else {
    console.log("inside of the regular no custom sell date option branch");
    const updatedInfo = response['Weekly Adjusted Time Series'];
    console.log("updated info");
    console.log(updatedInfo);

    let userInvestedDateValue = (document.getElementById("date_invested_field") as HTMLInputElement).value;
    // console.log("here's the user's invested date");
    // console.log(userInvestedDate);
    let userInvestedDate: string[] = userInvestedDateValue.split("-");
    const userInvestedYear = userInvestedDate[0];
    const userInvestedMonth = userInvestedDate[1];
    const userInvestedDay = userInvestedDate[2];
    console.log("After userInvestedDate Split");

    let indexDateInvested = findEntry(userInvestedYear, userInvestedMonth, userInvestedDay, response);
    console.log("After findEntry");
    let userAdjCloseInvested = updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]['5. adjusted close'];
    console.log(updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]);
    console.log(updatedInfo[Object.keys(updatedInfo)[indexDateInvested]]['5. adjusted close']);

    let amounts = document.querySelectorAll('.amount');
    let startMoney = (amounts[stockIteration] as HTMLInputElement).value;
    let symbols = document.querySelectorAll('.ticker');
    let symbol = (symbols[stockIteration] as HTMLInputElement).value;
    let marketPrice = updatedInfo[Object.keys(updatedInfo)[0]]['5. adjusted close'];
    console.log("Market Price: ");
    console.log(marketPrice);
    let investmentValue = ((parseFloat(startMoney) / parseFloat(userAdjCloseInvested)) * parseFloat(marketPrice));
    totalPortfolioValue += investmentValue;

    stockTracker[godCounter] = response['Meta Data']['2. Symbol'];
    moneyTracker[godCounter] = investmentValue;
    godCounter++;

    // investmentValue = investmentValue.toFixed(2);

    stockIteration = stockIteration - 1;
    if (stockIteration === -1) {
      let divArray = document.querySelectorAll(".stock_input");
      let totalP = document.createElement('p');
      let finalPortValue = totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
      totalP.textContent = "Your investment would be worth roughly: $" + finalPortValue + " in today's market...";
      for (let i = 0; i < divArray.length; i++) {
        let curr = divArray[i] as HTMLElement;
        curr.style.display = "none";
      }
      document.getElementById('portfolio_value')!.appendChild(totalP);
      let newSymbols = document.querySelectorAll('.ticker');
    
      for (let i = 0; i < stockTracker.length; i++) {
        let newStockInfo = document.createElement('p');
        let pArray = document.querySelectorAll('.removable');
        for (let j = 0; j < pArray.length; j++) {
          pArray[j].classList.add("remove");
        }
        newStockInfo.classList.add('removable');
        newStockInfo.textContent = "Your investment in " + stockTracker[i] +
          " would be worth roughly $" + moneyTracker[i].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('portfolio_value')!.appendChild(newStockInfo);
      }
    
      let newBtn = document.querySelector('#new_portfolio') as HTMLElement;
      newBtn.style['display'] = 'block';
      document.getElementById('add_stock')!.style.display = "none";
      document.getElementById('submission')!.style.display = "none";
      document.getElementById('custom_sell_date')!.style.display = "none";
    }
  }
}
    


// Checks the status of the response
async function statusCheck(res: Response): Promise<Response> {
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res;
}

// Finds the closest entry in the API week list based upon 
// a provided year, month, and date. Returns the index of the week which 
// is closest to the provided year, month and day input. 
function findEntry(year: string, month: string, day: string, response: any): number {
  var updatedInfo = response['Weekly Adjusted Time Series'];
  let length = Object.keys(updatedInfo).length
  let minIndex = 0;
  let min = 100000;
  let validData = false; // NOTE: UPDATE THIS TO INCLUDE IF THEY GO TOO EARLY LATER
  for (let i = 0; i < length; i++) {
    let tuple = Object.keys(updatedInfo)[i];
    let tupleData: string[] = tuple.split('-');
    if (tupleData[0] == year) {
      if (tupleData[1] == month) {
        if (tupleData[2] >= day || (day > tupleData[2] && (Math.abs(parseInt(tupleData[2]) - parseInt(day)) <= 7))) {
          let temp = Math.abs((parseInt(tupleData[2]) / 7) - (parseInt(day) / 7));
          if (temp < min) {
            min = temp;
            minIndex = i; 
          }
        }
      }
    }
  }
  // Return the minimum difference index between the date the user provided and the closest match in the weekly series
  return minIndex; 
}


function handleErr() {
  console.log("there was an error, ruh roh!");
}
