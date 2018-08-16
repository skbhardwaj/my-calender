(function(w) {
    'use strict';

    var d = new Date(),
        maxEventWidth = 600,
        // testDataForEvents = [{
        //         start: 0,
        //         end: 150
        //     },
        //     {
        //         start: 0,
        //         end: 360
        //     },
        //     {
        //         start: 0,
        //         end: 600
        //     },
        //     {
        //         start: 20,
        //         end: 360
        //     },
        //     {
        //         start: 20,
        //         end: 360
        //     },
        //     {
        //         start: 100,
        //         end: 300
        //     },
        //     {
        //         start: 150,
        //         end: 400
        //     },
        //     {
        //         start: 160,
        //         end: 350
        //     },
        //     {
        //         start: 310,
        //         end: 600
        //     },
        //     {
        //         start: 400,
        //         end: 600
        //     },
        //     {
        //         start: 400,
        //         end: 600
        //     },
        //     {
        //         start: 400,
        //         end: 600
        //     },
        //     {
        //         start: 410,
        //         end: 600
        //     },
        //     {
        //         start: 420,
        //         end: 600
        //     },
        //     {
        //         start: 600,
        //         end: 660
        //     },
        //     {
        //         start: 600,
        //         end: 720
        //     },
        //     {
        //         start: 600,
        //         end: 720
        //     },
        //     {
        //         start: 660,
        //         end: 720
        //     }
        // ],
        testDataForEvents = [{
            start: 30, // 9:30 am
            end: 150 // 11:30 am
        }, {
            start: 180, // 12:00 pm
            end: 225 // 12:45 pm
        }, {
            start: 545, // 6:00 pm
            end: 605 // 7:00 pm
        }, {
            start: 540, // 6:00 pm
            end: 600 // 7:00 pm
        }, {
            start: 560, // 6:20 pm
            end: 650 // 7:50 pm
        }, {
            start: 610, // 7:10 pm
            end: 670 // 8:10 pm
        }],
        eventsContainer = document.querySelector('.cal-events-container');

    /**
     * Method returns display time for the given Date object.
     * @function getDisplayTime
     * @private
     * @param {Date} date The date object.
     */
    function getDisplayTime(date) {
        var displayTime = '',
            isPM = date.getHours() >= 12,
            isMidday = date.getHours() === 12;

        displayTime = [date.getHours() - (isPM && !isMidday ? 12 : 0),
                date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
                // ,date.getSeconds() || '00'
            ].join(':') +
            (isPM ? ' PM' : ' AM');

        return displayTime;
    }

    /**
     * Method to update events in the calender.
     * @function updateEventsInCalender
     * @private
     * @param {Array} events The array of events containing start and end time.
     */
    function updateEventsInCalender(events) {
        for (var index = 0; index < events.length; index++) {
            var event = events[index];
            addEventInCalender(event);
        }
    }

    /**
     * Method to add an event in the calender container.
     * @function addEventInCalender
     * @private
     * @param {json} eventObj The event json object.
     */
    function addEventInCalender(eventObj) {
        var eventNode = document.createElement('DIV'),
            aTag = document.createElement('a'),
            spanTag = document.createElement('SPAN'),
            attrDraggable = document.createAttribute('draggable');

        aTag.innerText = eventObj.eventHeading || 'Test event heading';
        spanTag.innerText = eventObj.eventDescription || 'Test event description.';

        eventNode.appendChild(aTag);
        eventNode.appendChild(spanTag);
        eventNode.classList.add('cal-event'); // draggable="true"
        attrDraggable.value = 'true';
        eventNode.setAttributeNode(attrDraggable);

        eventNode.style.top = eventObj.top + 'px';
        eventNode.style.left = eventObj.left + 'px';
        eventNode.style.height = eventObj.height + 'px';
        eventNode.style.width = eventObj.width + 'px';

        eventsContainer.appendChild(eventNode);
    }

    /**
     * Method to create custom array to hold other utility event values.
     * @function getParsedEvents
     * @private
     * @param {Array} events The array of events containing start and end time.
     */
    function getParsedEvents(events) {
        var id = 0;

        return events
            .sort(function(a, b) {
                if ((a.start - b.start) === 0) {
                    return b.end - a.end;
                } else {
                    return a.start - b.start;
                }
            })
            .map(function(node) {
                var initialTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0),
                    durationMin = node.end - node.start,
                    startTime = new Date(initialTime.setMinutes(initialTime.getMinutes() + node.start)),
                    endTime = new Date(initialTime.setMinutes(initialTime.getMinutes() + durationMin));

                return {
                    start: node.start,
                    end: node.end,
                    top: node.start,
                    left: 0,
                    width: 200,
                    height: durationMin,
                    // block: null,
                    // column: null,
                    eventHeading: 'From ' + getDisplayTime(startTime) + ' to ' + getDisplayTime(endTime),
                    eventDescription: 'This would take around ' + durationMin + ' minutes. (' + node.start + ',' + node.end + ')',
                    id: id++
                };
            });
    }



    /**
     * Method to update the overlapping events from a given input of events.
     * @function updateOverlappingEvents
     * @private
     * @param {Array} events The array of events containing start and end time.
     */
    function updateOverlappingEvents(events) {
        if (!events) {
            return;
        }

        // console.log(events);
        for (var i = 0; i < events.length; i++) {
            var eventI = events[i],
                remainingEvents = events.slice(i + 1);

            // console.log(remainingEvents);
            // console.log('+++ I +++', eventI.start, eventI.end);
            eventI.overlappedWith = [];

            for (var j = 0; j < remainingEvents.length; j++) {
                var eventJ = remainingEvents[j];
                // console.log('+++ J +++', eventJ.start, eventJ.end);

                if (isOverlaping(eventI, eventJ)) {
                    // console.log('overlapping::::', eventI, eventJ);
                    eventI.overlappedWith.push(eventJ);

                    eventJ.left = (eventI.left + eventI.width);

                    if ((eventJ.left + eventJ.width) > maxEventWidth) {
                        eventJ.left = 0;
                    }
                } else {
                    // eventI.width = maxEventWidth;
                }
            }
        }
    }

    function isOverlaping(node, item) {
        if (item.start >= node.start && item.start < node.end) {
            return true;
        } else if ((node.start === item.start) || (node.end === item.end)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Method to create the calender from a given input of events.
     * @function createMyCal
     * @private
     * @param {Array} events The array of events containing start and end time.
     */
    function createMyCal(events) {
        var eventArr = [];

        // fallback to test data
        if (!events || !events.length) {
            events = testDataForEvents;
        }

        // clear previous events
        eventsContainer.innerHTML = '';

        eventArr = getParsedEvents(events);

        updateOverlappingEvents(eventArr);

        updateEventsInCalender(eventArr);

        console.log(eventArr);

        // console.log(eventsContainer.clientWidth, eventsContainer.innerWidth, eventsContainer.outerWidth);
    }

    w.createMyCal = createMyCal;
    createMyCal();

})(window);