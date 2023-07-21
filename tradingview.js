require("chromedriver");
let wd = require("selenium-webdriver");
let browser = new wd.Builder().forBrowser('chrome').build();

const fs = require('fs');
const { mainModule } = require("process");
let ALPHA_STOCKS  = [];
async function main(){
     let link = 'https://in.tradingview.com/markets/stocks-india/market-movers-gainers/';
    //  console.log("111111111111111111111111111111111111111111111111");
    let Gainer_DATA = await getGainersandLosers(link);
    
    link = link.replace("gainers","losers");
   
    
    let Loser_DATA = await getGainersandLosers(link);
    
     ALPHA_STOCKS =  Gainer_DATA.concat(Loser_DATA);
    // let ALPHA_STOCKS = [];
    // await Promise.all([getGainersandLosers(link),getGainersandLosers(link.replace("gainers","losers"))]).then(value => {
    //     ALPHA_STOCKS = value;
    // });
    //console.log(ALPHA_STOCKS);

     await getATRandVolume(ALPHA_STOCKS);
     fs.writeFileSync("tradingview.json",JSON.stringify(ALPHA_STOCKS));
     
}

async function getATRandVolume(ALPHA_STOCKS)
{
    await browser.get(`https://www.moneycontrol.com/india/stockpricequote/`);   
    for(let ALPHA_STOCK of ALPHA_STOCKS)
    {
        
        let name = ALPHA_STOCK.Symbol;
        if(name=="ABAN" || name=="REPL")
        {
            if(name=="REPL")
            {
                continue;
            }
            name = ALPHA_STOCK.Name;
            
        }
        await browser.wait(wd.until.elementLocated(wd.By.css("input.txtsrchbox.FL")));
        let search_bar = await browser.findElement(wd.By.css("input.txtsrchbox.FL"));
        search_bar.click();
        search_bar.sendKeys(name);
        let search_button = await browser.findElement(wd.By.css("a.top_search_btn"));
        search_button.click();
        await browser.wait(wd.until.elementLocated(wd.By.css(".nsev20a.bsev20a")));
        ALPHA_STOCK["Average_Daily_Trading_Volume(20D)"] = await browser.findElement(wd.By.css(".nsev20a.bsev20a")).getAttribute("innerText");
        ALPHA_STOCK["Average_Delievery_%age(20D)"] = await browser.findElement(wd.By.css(".nsed20ad.bsed20ad")).getAttribute("innerText");
    }
    
}
async function getGainersandLosers(link)
{
    await browser.get(link);
    await browser.wait(wd.until.elementsLocated(wd.By.css(".tv-data-table__row")));
    console.log("2222222222222222222222222222222222222222222222");
    let rows = await browser.findElements(wd.By.css(".tv-data-table__row"));
    let mainData = [];
    let c = 1;
    for(let row of rows)
    {
        if(mainData.length==5)
            {
                break;
            }
        let cols = await row.findElements(wd.By.css("td"));
        let vol = (await cols[5].getAttribute("innerText"));
        
        
        
           
            let obj = {};
            let symbol = await cols[0].findElement(wd.By.css(".tv-screener-table__symbol-container-description a"));
            obj["Symbol"] = await symbol.getAttribute("innerText");
            let Name = await cols[0].findElement(wd.By.css(".tv-screener__description")).getAttribute("innerText");
            obj["Name"] = Name;
            let price = await cols[1].findElement(wd.By.css("span")).getAttribute("innerText");
        
            obj["price"] = price;
            let gap_up_down = await cols[2].getAttribute("innerText");
            obj["gap_up_down"] = gap_up_down;
            let gap_price = await cols[3].getAttribute("innerText");
            obj["gap_price"] = gap_price;
            obj["volume_today"] = vol;

            let sector = await cols[10].findElement(wd.By.css("a span")).getAttribute("innerText");
            obj["sector"] = sector;

            mainData.push(obj);       
        

        
    }
   return (mainData);
}
main();