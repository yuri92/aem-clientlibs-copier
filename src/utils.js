const fs = require('fs');

module.exports = {
    getConfig : () => {
        let config;
        try {
            config = fs.readFileSync('./aem-clientlibs-copier.json');
            config = JSON.parse(config);
    
            // controllo che il json abbia tutti i campi
            ['source','destination','destinationIndex','cssAssets','reactorPom','asciiArtTitle'].forEach(prop => {
                if (!config.hasOwnProperty(prop)) {
                    throw `Nel json di configurazione non è presente la voce '${prop}'`
                }
            })
    
            return config;
    
        } catch (error) {
            console.error(error)
        }
    }
}