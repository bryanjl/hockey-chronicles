    const outcomeTest= () => {

        outcome =   {
            "61a024599b2769b03d357b78": 14,
            "61a024599b2769b03d357b7a": 16,
            "draw": 15
        }

        reqOutcome =   {
            "61a024599b2769b03d357b78": 15,
            "61a024599b2769b03d357b7a": 16,
            "draw": 17
        }



        //1) same winner as before -> no change
        let currOutcomeKeys = Object.keys(outcome);
        let currOutcomeValue = 0;
        let currOutcomeWinner;
        for(let i = 0; i < currOutcomeKeys.length; i++){
            if(outcome[currOutcomeKeys[[i]]] > currOutcomeValue) {
                currOutcomeWinner = currOutcomeKeys[i];
                currOutcomeValue = outcome[currOutcomeKeys[[i]]];
            }
        }

        let reqOutcomeKeys = Object.keys(reqOutcome);
        let reqOutcomeValue = 0;
        let reqOutcomeWinner;
        for(let i = 0; i < reqOutcomeKeys.length; i++){
            if(reqOutcome[reqOutcomeKeys[i]] > reqOutcomeValue){
                reqOutcomeWinner = reqOutcomeKeys[i];
                reqOutcomeValue = reqOutcome[reqOutcomeKeys[i]];
            }
        }

        console.log(currOutcomeWinner, reqOutcomeWinner)

        if(currOutcomeWinner === reqOutcomeWinner){
            // this.outcome = reqOutcome;
            console.log('same winner');
            return;
        }

        console.log('not same winner')
    }
    
    outcomeTest();