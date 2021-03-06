const source = require('rfr');

const { getSpotifyAuthToken } = source('bot/spotify/spotifyApi');

const SpotifyController = {
    get(req, res) {
        const userid = req.query.state;
        const { code } = req.query;
        const error = req.query.error || 'Missing the userid and the authentication code';

        if (userid && code) {
            getSpotifyAuthToken(userid, code);
            res.render('authenticate');
        } else {
            res.render('authenticateError', {
                error,
            });
        }
    },
};

module.exports = SpotifyController;
