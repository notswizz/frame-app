/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog';
import { handle } from 'frog/vercel';
import { logSelection, getSelectionsByFID } from'../../../mongodb';

const app = new Frog({
  basePath: '/api',
});

const matchups = [
  { team1: 'Duke', team2: 'UNC', team1Color: '#003366', team2Color: '#7BAFD4' },
  { team1: 'Auburn', team2: 'UGA', team1Color: '#0C2340', team2Color: '#BA0C2F' },
  { team1: 'Kentucky', team2: 'Tennessee', team1Color: '#0033A0', team2Color: '#FF8200' },
];

interface Selection {
  matchupIndex: number;
  team: string;
}


let picks: string[] = [];

app.frame('/', async (c) => {
  const fid = c.frameData?.fid ?? 'unknown';
  const selections = await getSelectionsByFID(fid);
  const myPicksAction = selections.length > 0 ? '/mypicks' : '/no-picks';

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'black',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            display: 'flex',
            fontSize: 60,
            flexDirection: 'column',
            marginTop: 30,
          }}
        >
          March Madness Frame Bracket
        </div>
      </div>
    ),
    intents: [
      <Button action="/matchups" value="enter">Enter</Button>,
      <Button action={myPicksAction} value="mypicks">My Picks</Button>,
    ],
  });
});


app.frame('/matchups', (c) => {
  let nextMatchupIndex = picks.length;
  const { team1, team2 } = matchups[nextMatchupIndex];

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'black',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            display: 'flex',
            fontSize: 60,
            flexDirection: 'column',
            marginTop: 30,
          }}
        >
          {team1} vs {team2}
        </div>
      </div>
    ),
    intents: [
      <Button action={`/confirm/${nextMatchupIndex}`} value={team1}>{team1}</Button>,
      <Button action={`/confirm/${nextMatchupIndex}`} value={team2}>{team2}</Button>,
    ],
  });
});

app.frame('/confirm/:matchupIndex', (c) => {
  const buttonValue = c.buttonValue as string;
  const matchupIndex = parseInt(c.req.param('matchupIndex'));
  const { team1, team2, team1Color, team2Color } = matchups[matchupIndex];
  const backgroundColor = buttonValue === team1 ? team1Color : team2Color;

  // Extract fid directly from frameData
  const fid = c.frameData?.fid ?? 'unknown';

  // Update the selected team when the "Confirm" button is clicked
  if (typeof buttonValue === 'string') {
    picks[matchupIndex] = buttonValue;
    // Log fid and team selection
    console.log(`User FID: ${fid}, Selection: Matchup ${matchupIndex}, Team: ${buttonValue}`);
    logSelection(fid, matchupIndex, buttonValue);
  }

  const nextMatchupIndex = matchupIndex + 1;
  const nextAction = nextMatchupIndex < matchups.length ? `/matchups?matchupIndex=${nextMatchupIndex}` : '/submit';

  return c.res({
    action: nextAction,
    image: (
      <div
        style={{
          alignItems: 'center',
          background: backgroundColor,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            display: 'flex',
            fontSize: 60,
            flexDirection: 'column',
            marginTop: 30,
          }}
        >
          Confirm: {buttonValue}
        </div>
      </div>
    ),
    intents: [
      <Button action={nextAction} value="confirm">Confirm</Button>,
 
    ],
  });
});


app.frame('/submit', (c) => {
  // Reset picks array after submitting
  picks = [];

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'green',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            display: 'flex',
            fontSize: 60,
            flexDirection: 'column',
            marginTop: 30,
          }}
        >
          Good Luck
        </div>
      </div>
    ),
    intents: [
      // Redirect to the home screen after submitting picks
      <Button action="/" value="home">Home</Button>,

    ],
  });
});


app.frame('/mypicks', async (c) => {
  const fid = c.frameData?.fid ?? 'unknown';
  const selections = await getSelectionsByFID(fid);
  const picksElements = selections.map((pick: Selection) => (
    <div style={{ color: 'white', fontSize: 40, marginTop: 10 }}>{pick.team}</div>
  ));

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'black',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            display: 'flex',
            fontSize: 60,
            flexDirection: 'column',
            marginTop: 30,
          }}
        >
          FID: {fid}
        </div>
        {picksElements}
      </div>
    ),
    intents: [
      <Button action="/" value="home">Home</Button>,
    ],
  });
});

app.frame('/no-picks', (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'black',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            display: 'flex',
            fontSize: 60,
            flexDirection: 'column',
            marginTop: 30,
          }}
        >
          No picks submitted yet!
        </div>
      </div>
    ),
    intents: [
      <Button action="/" value="home">Home</Button>,
    ],
  });
});


export const GET = handle(app);
export const POST = handle(app);