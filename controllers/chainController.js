import { LinkHorizontal } from '@vx/shape'
import { Group } from '@vx/group'

/**
      tree: { name: 'Genesis', type: 'block',
        children: [{ name: 'A', type: 'block',
          children: [{ name: 'A1', type: 'user' }, { name: 'A2', type: 'user' }, { name: 'A3', type: 'user' }, { name: 'C', type: 'block',
              children: [{ name: 'C1', type: 'user'}, {name: 'D', type:'block',
                  children: [{ name: 'D1', type: 'user' },{ name: 'D2', type: 'user' },{ name: 'D3', type: 'user'}
                ]
              }]
            },
          ]},
        ],
      }
**/



var chain = {
  Node({node, events}){
    let width = 40;
    let height = 20;
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
              alert(`clicked: ${JSON.stringify(node.data.id)} Node`)
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
          {node.data.id}
        </text>
      </Group>
    );
  },
  Link({ link }){
    return (
      <LinkHorizontal
        data={link}
        stroke="#374469"
        strokeWidth="1"
        fill="none"
      />
    )
  }
}

module.exports = chain
