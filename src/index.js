const utils = require('./utils')

const rimraf = require('rimraf');
const fs = require('fs');
const glob = require("glob")
const figlet = require('figlet');
const xml2js = require('xml2js');

const ncp = require('ncp').ncp;
ncp.limit = 16;

const generateAsciiArt = config => {

    return new Promise((resolve, reject) => {
      xml2js.parseString(fs.readFileSync(config.reactorPom), (err, result) => {
        if (err) {
          reject(err);
          return console.log(err);
        }
        const version = result.project.properties[0]['global.version'][0];
        const asciiArtSource = `${config.asciiArtTitle} v${version}`
        figlet(asciiArtSource, {
          font: 'Big',
        }, function(err, asciiArt) {
          fs.readFile(config.destinationIndex, 'utf8', function(err, data) {
            if (err) {
              reject(err);
              return console.log(err);
            }
            var result = data.replace(/\${nameVersion}/g, asciiArt);
  
            fs.writeFile(config.destinationIndex, result, 'utf8', function(err) {
              if (err) {
                reject(err);
                return console.log(err);
              }
              console.log(`- Generated ASCII Art with content ${asciiArtSource} to put on top of index.html`);
              resolve();
  
            });
          });
        });
      });
    })
  }
  

const start = () => {
    const config = utils.getConfig();
    if(!config) return;

    // mostro a video la versione corrente
    const currentVersion = JSON.parse(fs.readFileSync('./package.json')).version
    figlet(`Copier ${currentVersion}`, {
        font: 'Big',
    }, (err, asciiArt) => {
        
        console.log(asciiArt);

        setTimeout(() => {
            const start = new Date();
            //Elimino la cartella con tutte le clientlibs vecchie
            rimraf(config.destination, err => {
              
              if (err)
                return console.error(err)
              else {
                console.log('- Deleted AEM folder with all old clientlibs')
                //Copio tutti i generati nel dist dentro ui.apps
                ncp(config.source, config.destination, function(err) {
                  if (err) {
                    return console.error(err);
                  } else {
                    console.log(`- All files copied from /dist to aem clientlib`)
          
                    //copio index.html con i puntamenti ai js e css all'interno della structure aem
                    fs.copyFile(`${config.source}/index.html`, config.destinationIndex, (err) => {
                      if (err) throw err;
          
                      console.log('- index.html file copied from /dist to aem page structure')
          
                      //Inserisco ASCII Art con nome progetto e versione
                      generateAsciiArt(config).then(() => {
                        //MOMENTANEO
                        //Cambio tutti i puntamenti URL dei css
                        glob(`${config.destination}/styles.*.css`, function(er, files) {
            
                          fs.readFile(files[0], 'utf8', function(err, data) {
                            if (err) {
                              return console.log(err);
                            }
                            var result = data.replace(/\/assets\//g, config.cssAssets);
            
                            fs.writeFile(files[0], result, 'utf8', function(err) {
                              if (err) return console.log(err);
                              console.log(`- Edited styles.*.css, all "/assets/" occurrences have been replaced with "${config.cssAssets}"`);
                              console.log(`\nProcess completed successfully in ${(new Date() - start) / 1000}s\nCopier out.`);
                            });
                          });
                        })
          
                      });
          
                    });
                  }
                });
              }
            })
          }, 2000)

    });

}   

start()
exports.start = start;