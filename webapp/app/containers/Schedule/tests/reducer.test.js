
import { fromJS } from 'immutable';
import scheduleReducer from '../reducer';

describe('scheduleReducer', () => {
  it('returns the initial state', () => {
    expect(scheduleReducer(undefined, {})).toEqual(fromJS({}));
  });
});
