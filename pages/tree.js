import { Group } from '@vx/group';
import { Tree } from '@vx/hierarchy';
import { LinkHorizontal } from '@vx/shape';
import { hierarchy } from 'd3-hierarchy';
import { LinearGradient } from '@vx/gradient';

const raw = {
  "name": "Genesis",
  "color": 'blue',
  "children": [{
    "name": "A",
    "children": [
      { "name": "A1" },
      { "name": "A2" },
      { "name": "A3" },
      { "name": "C",
        "children": [{
          "name": "C1",
        }, {
          "name": "D",
          "children": [{
            "name": "D1"
          },{
            "name": "D2"
          },{
            "name": "D3"
          }]
        }]
      },
    ]},
    { "name": "Z" },
    {
    "name": "B",
    "children": [
      { "name": "B1"},
      { "name": "B2"},
      { "name": "B3"},
    ]},
  ],
};

function Node({ node, events }) {
  const width = 40;
  const height = 20;
  return (
    <Group top={node.x} left={node.y}>
      {node.depth === 0 &&
        <circle
          r={22}
          fill={"url('#lg')"}
        />
      }
      {node.depth !== 0 &&
        <rect
          height={height}
          width={width}
          y={-height / 2}
          x={-width / 2}
          fill={"#272b4d"}
          stroke={node.children ? "pink" : "#26deb0"}
          strokeWidth={1}
          strokeDasharray={!node.children ? "2,2" : "0"}
          strokeOpacity={!node.children ? .6 : 1}
          rx={!node.children ? 10 : 0}
          onClick={() => {
            alert(`clicked: ${JSON.stringify(node.data.name)} Node`)
          }}
          onMouseOver={(e, f) => {
            console.log('e.target', e.target)
          }}
        />
      }
      <text
        dy={".33em"}
        fontSize={12}
        fontFamily="Arial"
        textAnchor={"middle"}
        style={{ pointerEvents: "none" }}
        fill={node.depth === 0 ? "#71248e" : node.children ? "white" : "#26deb0"}
      >
        {node.data.name}
      </text>
    </Group>
  );
}

function Link({ link }) {
  return (
    <LinkHorizontal
      data={link}
      stroke="#374469"
      strokeWidth="1"
      fill="none"
    />
  );
}

export default ({
  width,
  height,
  events = false,
  margin = {
    top: 10,
    left: 30,
    right: 40,
    bottom: 80,
  }
}) => {
  const data = hierarchy(raw);
  return (
    <svg width={'100vw'} height={'100vh'}>
      <LinearGradient id="lg" from="#fd9b93" to="#fe6e9e" />
      <rect
        width={'100vw'}
        height={'100vh'}
        rx={14}
        fill="#272b4d"
      />
      <Tree
        top={margin.top}
        left={margin.left}
        root={data}
        size={[
          800,
          1000
        ]}
        nodeComponent={Node}
        linkComponent={Link}
      />
    </svg>
  );
}
