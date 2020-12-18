const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const RequestIp = require('@supercharge/request-ip');

const userRoutes = require('./routes/User');
const meteoRoutes = require('./routes/Meteo');
const youtubeRoutes = require('./routes/Youtube');
const discordRoutes = require('./routes/Discord');
const steamRoutes = require('./routes/Steam');
const newsRoutes = require('./routes/News');


const app = express();
app.use(cors());
mongoose.connect('mongodb://db:27017/dashboard',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    promiseLibrary: global.Promise,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});
app.get('/', function(req, res) {
  res.send("Serv Up !");
})

app.use('/api/auth', userRoutes);
app.use('/api/widget/meteo', meteoRoutes);
app.use('/api/widget/youtube', youtubeRoutes);
app.use('/api/widget/discord', discordRoutes);
app.use('/api/widget/steam', steamRoutes);
app.use('/api/widget/news', newsRoutes);
app.use('/about.json', function(req, res, next) {
  return res.status(200).json({
    client: {
      host: RequestIp.getClientIp(req)
    },
    server: {
      current_time: Math.floor(Date.now() / 1000),
      services: [{
          name: "weather",
          widgets: [{
              name: "meteo",
              description: "Display weather information for a city",
              params: [
                {
                  name: "city",
                  type: "string"
                }, {
                  name: "temp",
                  type: "integer"
                }]
            }]
        }, {
          name: "info",
          widgets: [{
              name: "info",
              description: "Display Info for preset categorie",
              params: [{
                name: "info",
                type: "string"
              }]
          }]
        },{
          name: "discord",
          widgets: [{
              name: "guilds",
              description: "Display guilds List for Authenticate User",
              params: [{
                  name: "code",
                  type: "string"
                }]
            }]
        }, {
          name: "youtube",
          widgets: [{
              name: "youtube",
              description: "Search and Play Youtube video",
              params: []
            }]
        }, {
          name: "steam",
          widgets: [{
              name: "Time",
              description: "Get Times played on recent game",
              params: [{
                  name: "steamid",
                  type: "integer"
                }]
            }, {
              name: "Game Info",
              description: "Search and Get Information and players on a game",
              params: [{
                  name: "appid",
                  type: "integer"
                }]
            }, {
              name: "Friend List",
              description: "Display Friends for authenticate User",
              params: [{
                  name: "steamid",
                  type: "string"
                }]
            }]
        }]
    }
  })
})
module.exports = app;
