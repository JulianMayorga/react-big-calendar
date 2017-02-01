import React from 'react';

import EventRowMixin from './EventRowMixin';
import { segStyle } from './utils/eventLevels';


let EventCells = React.createClass({

  displayName: 'EventCells',

  propTypes: {
    segments: React.PropTypes.array,
    range: React.PropTypes.arrayOf(
      React.PropTypes.instanceOf(Date)
    )
  },

  mixins: [EventRowMixin],

  render() {
    let { segments, range } = this.props;

    return (
      <div className='rbc-row-bg'>
        {range.map(date => {
          return (
            <div className='rbc-event-cell-container' style={segStyle(1, range.length)} >
              <div className="rbc-event-inner-cell-container">{
                segments.map(({ event }) => {
                  if (event.start.getDay() === date.getDay() && date.getDay() === event.end.getDay()) {
                    return this.renderEvent(event);
                  }
                  return <div></div>;
                })
              }</div>
            </div>
          );
        })}
      </div>
    )
  }
});

export default EventCells
