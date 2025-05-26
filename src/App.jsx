import './App.css';
import React from 'react';

class App extends React.Component {

  playingNow = ''
  iceMode = 'local'  // or 'caster'

  constructor(props) {
    super(props);
    this.state = {
      songs: [],
      user: window.user,
      source: {
        listeners: 0,
        listener_peak: 0,
        bitrate: 0
      }
    }
    this.urlPart = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8080/'
  }

  saveSong = (title) => {
    let fixedTitle = title.replace('+', '_')
    let url = `${this.urlPart}radio-tune.php?djName=${this.state.user.djName}&title=` + encodeURIComponent(fixedTitle)
    //let url = 'https://triggerless.com/api/radio/tune/' + this.state.user.djName + '/' + title.replace('+', '_');
    //let url = 'http://localhost:61120/api/radio/tune/' + this.state.user.djName + '/' + title.replace('+', '_');
    
    fetch(url)
    .then(resp => resp.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
    
  }

  currentSong = () => {
    //let url = `${this.urlPart}radio-caster.php?id=${this.state.user.casterFmId}`
    //let url = 'https://shaincast.caster.fm:' + this.state.user.casterFmId + '/status-json.xsl';
    let url = (this.iceMode == 'local') ? 
      'https://live.triggerless.com:8443/status-json.xsl' :
      'https://shaincast.caster.fm:' + this.state.user.casterFmId + '/status-json.xsl'
    try {
      fetch(url)
        .then(response => response.json())
        .then(data => {
          let lastSong = this.state.songs.length > 0 ? this.state.songs[0] : '';
          if (data.icestats.source) {
            this.setState({
              ...this.state, 
              source: data.icestats.source
            })
            let thisSong = data.icestats.source.title;
            if ((thisSong !== lastSong || lastSong === '') && thisSong) {
              this.saveSong(thisSong);
              this.setState({
                ...this.state, 
                songs: [thisSong, ...this.state.songs]
              });
            }
          }
        })
        .catch(e => {
          console.log(`Unable to connect to ${url} when the station is off the air`)
        })
      } catch (e) {
        console.log(e.message)
      } finally {
        setTimeout(this.currentSong, 6000)
      }
    }

  componentDidMount() {
    let url = `${this.urlPart}radio-list.php?djName=${this.state.user.djName}&maxRows=${this.state.user.maxRows}`
    //let url = 'https://triggerless.com/api/radio/list/' + this.state.user.djName + '/' + this.state.user.maxRows;
    //let url = 'http://localhost:61120/api/radio/list/' + this.state.user.djName + '/' + this.state.user.maxRows;
    fetch(url)
    .then(resp => resp.json())
    .then(data => {
      this.setState({...this.state, songs: data.titles});
    })
    .catch();


    this.currentSong()
  }

  render() {
    return (
      <div className="app-container" style={{borderColor: this.state.user.borderColor}}>
        <div className="app">
          <div className="app-header" style={{borderColor: this.state.user.borderColor}}>Songs Played:
            <div style={{display: 'inline-block', float: 'right'}}>
              Listeners: {this.state.source.listeners}
              <span style={{marginLeft: '15px', marginRight: '15px'}}>
                ({this.state.source.listener_peak} @ peak)
              </span> 
              Bitrate: {this.state.source.bitrate}
            </div>
          </div>
          {
            this.state.songs.map((song, i) => {
              return (
                <div className="app-item"  style={{borderColor: this.state.user.borderColor}} key={i}>
                  <a target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}href={'https://www.youtube.com/results?search_query=' + encodeURIComponent(song)}>
                    <span className="app-note" title="Search YouTube">&#119070;&nbsp;&nbsp;</span>
                  </a> {song}{i === 0 ? ' (Playing Now)' : ''}
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }
}

export default App;
