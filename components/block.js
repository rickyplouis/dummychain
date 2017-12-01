import { LinkHorizontal } from '@vx/shape'
import { Group } from '@vx/group'
import { withTooltip, Tooltip } from '@vx/tooltip';

import { Button, Popup } from 'semantic-ui-react'

function renderNode(node) {
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
              stroke={node.children ? "pink": "#26deb0"}
              strokeWidth={1}
              strokeDasharray={!node.children ? "2,2" : "0"}
              strokeOpacity={!node.children ? .6 : 1}
              rx={!node.children ? 10 : 0}
              onClick={() => {
                alert(`clicked: ${JSON.stringify(node.data.id)} Node`)
              }}
              onMouseOver={(e) => {
                e.preventDefault()
                console.log('withTooltip', withTooltip);
                console.log('e.target', e.target)
              }}
              onMouseLeave={(e) => {
                e.preventDefault()
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
  )
}

var chain = {
  Node({node, events}){

      return (
          <Popup
            trigger={renderNode(node)}
            content={`Node name: ${node.data.id}`}
            basic
          />
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
