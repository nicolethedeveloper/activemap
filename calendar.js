// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com

    var ref = new Firebase("https://activemap.firebaseio.com/features/");

    var CLIENT_ID = '496480343904-pav855ihusiubb1emo3193es15u36evt.apps.googleusercontent.com';

    var SCOPES = ["https://www.googleapis.com/auth/calendar"];

    /**
     * Check if current user has authorized this application.
     */
    function checkAuth() {
        gapi.auth.authorize(
            {
                'client_id': CLIENT_ID,
                'scope': SCOPES.join(' '),
                'immediate': true
            }, handleAuthResult);
    }

    /**
     * Handle response from authorization server.
     *
     * @param {Object} authResult Authorization result.
     */
    function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
            loadCalendarApi();
        } else {
            // Show auth UI, allowing the user to initiate authorization by
            // clicking authorize button.
            console.log("Cannot Load!")
        }
    }

    /**
     * Initiate auth flow in response to user clicking authorize button.
     *
     * @param {Event} event Button click event.
     */

    function handleAuthClick(event) {
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            handleAuthResult);
        return false;
    }

    gapi.auth.authorize(
        {client_id: CLIENT_ID, scope: SCOPES, immediate: true},
        handleAuthResult);


    /**
     * Load Google Calendar client library. List upcoming events
     * once client library is loaded.
     */
    function loadCalendarApi() {
        gapi.client.load('calendar', 'v3', listUpcomingEvents);
    }

    /**
     * Print the summary and start datetime/date of the next ten events in
     * the authorized user's calendar. If no events are found an
     * appropriate message is printed.
     */
    function listUpcomingEvents() {
        var rooms;
        console.log("0");
        var request = gapi.client.calendar.events.list({
            'calendarId': "4m0fn554mbtn714d84dnu2tuvk@group.calendar.google.com",
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        });

        request.execute(function (resp) {
            var events = resp.items;
            //Go through events and write them to Firebase
            for (i in events) {
                var event = events[i];
                var eventLoc = event.location;
                // console.log(eventLoc);
                // console.log(typeof(eventLoc));

                var eventName = event.summary;
                //Loop through firebase and find the correct room
                ref.once("value", function (snapshot) {
                    rooms = snapshot.val();
                    // console.log(rooms);
                });
                    for (var j = 0; j < rooms.length; j++) {
                        if (rooms[j].properties.ABV == eventLoc) {
                            var NameRef = new Firebase('https://activemap.firebaseio.com/features/' + j + "/properties");
                            NameRef.child('Event').set(eventName);
                        }
                    }

            }
        });
    }
