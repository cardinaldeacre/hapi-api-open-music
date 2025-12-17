class Listener {
    constructor(playlistsService, mailSender) {
        this._playlistService = playlistsService;
        this._mailSender = mailSender;

        this.listen = this.listen.bind(this);
    }

    async listen(message) {
        try {
            const { playlistId, targetEmail } = JSON.parse(message.content.toString());

            const playlistData = await this._playlistService.getPlaylistSongs(playlistId);
            const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(playlistData))

            console.log(result);
        } catch (error) {
            console.error(error)
        }
    }
}

module.exports = Listener;