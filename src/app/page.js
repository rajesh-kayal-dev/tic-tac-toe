
import Footer from "./components/Footer";
import Game from "./components/Game";

export default function Home() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', color: '#93a1a1' }}>Tic Tac Toe</h1>
      <Game/>
      <Footer />
   </div>
  );
}
