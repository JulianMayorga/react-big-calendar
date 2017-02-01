import cn from 'classnames';
import getHeight from 'dom-helpers/query/height';
import qsa from 'dom-helpers/query/querySelectorAll';
import React from 'react';
import { findDOMNode } from 'react-dom';

import dates from './utils/dates';
import { accessor, elementType } from './utils/propTypes';
import { segStyle, eventSegments, endOfRange, eventLevels } from './utils/eventLevels';
import BackgroundCells from './BackgroundCells';
import EventCells from './EventCells';

let isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot;

const propTypes = {
  events: React.PropTypes.array.isRequired,
  range: React.PropTypes.array.isRequired,

  rtl: React.PropTypes.bool,
  renderForMeasure: React.PropTypes.bool,
  renderHeader: React.PropTypes.func,

  container: React.PropTypes.func,
  selected: React.PropTypes.object,
  selectable: React.PropTypes.oneOf([true, false, 'ignoreEvents']),

  onShowMore: React.PropTypes.func,
  onSelectSlot: React.PropTypes.func,
  onSelectEnd: React.PropTypes.func,
  onSelectStart: React.PropTypes.func,

  startAccessor: accessor.isRequired,
  endAccessor: accessor.isRequired,

  dateCellWrapper: elementType,
  eventComponent: elementType,
  eventWrapperComponent: elementType.isRequired,
  minRows: React.PropTypes.number.isRequired,
  maxRows: React.PropTypes.number.isRequired,
};

const defaultProps = {
  minRows: 0,
  maxRows: Infinity,
}

class DateContentRow extends React.Component {

  constructor(...args) {
    super(...args);
  }

  handleSelectSlot = (slot) => {
    const { range, onSelectSlot } = this.props;

    onSelectSlot(
      range.slice(slot.start, slot.end + 1),
      slot,
    )
  }

  handleShowMore = (slot) => {
    const { range, onShowMore } = this.props;
    let row = qsa(findDOMNode(this), '.rbc-row-bg')[0]

    let cell;
    if (row) cell = row.children[slot-1]

    let events = this.segments
      .filter(seg => isSegmentInSlot(seg, slot))
      .map(seg => seg.event)

    onShowMore(events, range[slot-1], cell, slot)
  }

  createHeadingRef = r => {
    this.headingRow = r;
  }

  createEventRef = r => {
    this.eventRow = r;
  }

  getContainer = () => {
    const { container } = this.props;
    return container ? container() : findDOMNode(this)
  }

  getRowLimit() {
    let eventHeight = getHeight(this.eventRow);
    let headingHeight = this.headingRow ? getHeight(this.headingRow) : 0
    let eventSpace = getHeight(findDOMNode(this)) - headingHeight;

    return Math.max(Math.floor(eventSpace / eventHeight), 1)
  }

  renderHeadingCell = (date, index) => {
    let { renderHeader, range } = this.props;

    return renderHeader({
      date,
      key: `header_${index}`,
      style: segStyle(1, range.length),
      className: cn(
        'rbc-date-cell',
        dates.eq(date, new Date(), 'day') && 'rbc-now', // FIXME use props.now
      )
    })
  }

  renderDummy = () => {
    let { className, range, renderHeader } = this.props;
    return (
      <div className={className}>
        <div className='rbc-row-content'>
          {renderHeader && (
            <div className='rbc-row' ref={this.createHeadingRef}>
              {range.map(this.renderHeadingCell)}
            </div>
          )}
          <div className='rbc-row' ref={this.createEventRef}>
            <div className='rbc-row-segment' style={segStyle(1, range.length)}>
              <div className='rbc-event'>
                <div className='rbc-event-content'>&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      rtl,
      events,
      range,
      className,
      selectable,
      renderForMeasure,
      startAccessor,
      endAccessor,
      renderHeader,
      minRows, maxRows,
      dateCellWrapper,
      eventComponent,
      eventWrapperComponent,
      onSelectStart,
      onSelectEnd
    } = this.props;

    if (renderForMeasure)
      return this.renderDummy();

    let { first, last } = endOfRange(range);

    let segments = this.segments = events.map(evt => eventSegments(evt, first, last, {
      startAccessor,
      endAccessor
    }))

    let { levels } = eventLevels(segments, Math.max(maxRows - 1, 1));
    while (levels.length < minRows ) levels.push([])

    return (
      <div className={className}>
        <BackgroundCells
          rtl={rtl}
          range={range}
          selectable={selectable}
          container={this.getContainer}
          onSelectStart={onSelectStart}
          onSelectEnd={onSelectEnd}
          onSelectSlot={this.handleSelectSlot}
          cellWrapperComponent={dateCellWrapper}
          eventComponent={eventComponent}
          eventWrapperComponent={eventWrapperComponent}
          />
        <EventCells
          rtl={rtl}
          range={range}
          selectable={selectable}
          container={this.getContainer}
          onSelectStart={onSelectStart}
          onSelectEnd={onSelectEnd}
          onSelectSlot={this.handleSelectSlot}
          cellWrapperComponent={dateCellWrapper}
          eventComponent={eventComponent}
          eventWrapperComponent={eventWrapperComponent}
          segments={segments}
          />

        <div className='rbc-row-content'>
          {renderHeader && (
            <div className='rbc-row' ref={this.createHeadingRef}>
              {range.map(this.renderHeadingCell)}
            </div>
          )}
        </div>
      </div>
    );
  }
}

DateContentRow.propTypes = propTypes;
DateContentRow.defaultProps = defaultProps;

export default DateContentRow
