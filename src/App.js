import './App.css';
import Layout from './layout';

function App() {
  const setMarquee = {height:'50px',display:'flex',alignItems:'center',overflow:'none'}
  return (
    <div className="" style={{backgroundColor:'#473c8a'}}>
      <div style={setMarquee}>
        <marquee width="98%" direction="left" ><h1 className="header">Annotation Tool Component</h1></marquee>
      </div>
      
      <Layout />
    </div>
  );
}

export default App;
