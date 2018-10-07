class Selection {
  constructor( lines ) {
    this.queue = lines;
    this.current_position = 0;
    this.results = [];
  }

  hasMore() {
    return this.current_position < this.queue.length;
  }
  
  next() {
    var to_return = this.queue[this.current_position];
    this.current_position = this.current_position + 1;
    return to_return;
  }

  addResult( result ) {
    this.results.push( result );
  }

  getResults()
  {
    return this.results;
  }
}
