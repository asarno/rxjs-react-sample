const Rx = require('rxjs/Rx');

class Upstream {
  constructor() {
    this.stream = new Rx.BehaviorSubject();
    this.history = [];
    this.getHistory();
    this.eventTypes = {};
    this.recordActionTypes();
    window.timeTravelToPointN = this.timeTravelToPointN.bind(this);
  }

  dispatch(data) {
    if (!(data.hasOwnProperty('data') && data.hasOwnProperty('type'))) {
      throw new Error('Actions dispatched upstream must be objects with data and type properties')
    }
    this.stream.next(data);
  }
  
  dispatchSideEffect(streamFunction) {
    console.log('dispatchSideEffect called with', streamFunction)
    const sideEffectStream = streamFunction(this.stream.filter(action => action));
    sideEffectStream.subscribe((action) => {
        console.log('SIDE EFFECT:', action)
      this.dispatch(action);
    })
  }

  dispatchSideEffect(streamFunction) {
    const sideEffectStream = streamFunction(this.stream.filter(action => action).skip(1));
    sideEffectStream.subscribe((action) => {
        console.log('SIDE EFFECT:', action)
      this.dispatch(action);
    })
  }

   recordActionTypes() {
    this.actionStream = this.stream.filter(action => action).map(action => action.type)
    this.actionStream.subscribe(type => this.eventTypes[type] = true);
  }

   recordActionTypes() {
    this.actionStream = this.stream.filter(action => action).map(action => action.type)
    this.actionStream.subscribe(type => this.eventTypes[type] = true);
  }

  filterForAction(actionType) {
    return this.stream.filter(el => {
      return el ? (el.type === actionType) : el
    })
      .map(el => el ? el.data : el)
  }

  getHistory() {
    this.historyStream = this.stream.filter(action => action && !action.ignore)
      .scan((acc, cur) => {
        acc.push(cur);
        return acc;
      }, [])
      .publish()
    this.historyStream.connect();
    this.historyStream.subscribe(el => {
      console.log("actual history stream:", el)
      this.history = el
    })
  }

  logHistory() {
    Object.keys(this.eventTypes).forEach(event => {
      let action = { data: null, type: event, ignore: true }
      this.dispatch(action);
    });
    console.log(this.history);

  }

  timeTravelToPointN(n){
    this.logHistory();
    for (let i = 0; i <= n; i++) {
      this.dispatch(Object.assign({ignore: true}, this.history[i]));
    }
  }

}


export default function createUpstream() {
  return new Upstream();
}
