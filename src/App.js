import logo from './logo.svg';
import './App.css';
import Layout from './layout';

function App() {
  const App ={
    overflow:'hidden',
    padding:'0px 0px 15px 0px'
  }
  return (
    <div className="App" style={App}>
      <marquee className='header' width="98%" direction="left" >Annotation Tool Component</marquee>
      <Layout />
    </div>
  );
}

export default App;
