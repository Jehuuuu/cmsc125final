// Import necessary components
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import SortIcon from '@mui/icons-material/Sort';

// This is a functional component that renders the enhanced table header for a process control block (PCB)
export default function TableHeader(props) {
    // The component returns a div with enhanced styling and functionality
    return (
        <div className={"pcb-table-header enhanced-header " + (props.data.length > 2 ? "table-scroll" : "table-no-scroll")}>
            {/* Empty div for CPU Scheduler indicator */}
            <div className="pcb-table-cell header-cell">
                <span className="header-icon">🔄</span>
            </div>

            {/* Enhanced header cells with tooltips and sorting */}
            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Unique identifier for each process</Tooltip>}
            >
                <div className="pcb-table-cell header-cell sortable">
                    Process ID
                    <SortIcon className="sort-icon" />
                </div>
            </OverlayTrigger>

            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Remaining CPU time needed (decreases during execution)</Tooltip>}
            >
                <div className="pcb-table-cell header-cell sortable">
                    Burst Time
                    <SortIcon className="sort-icon" />
                </div>
            </OverlayTrigger>

            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Memory space required by the process</Tooltip>}
            >
                <div className="pcb-table-cell header-cell">
                    Memory Size
                </div>
            </OverlayTrigger>

            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Time when process entered the system</Tooltip>}
            >
                <div className="pcb-table-cell header-cell sortable">
                    Arrival Time
                    <SortIcon className="sort-icon" />
                </div>
            </OverlayTrigger>

            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Process priority (1=highest, 10=lowest) - Only used in Priority scheduling</Tooltip>}
            >
                <div className={"pcb-table-cell header-cell " + 
                    (props.policy !== "Priority" ? "color-gray disabled-header" : "sortable")}>
                    Priority
                    {props.policy === "Priority" && <SortIcon className="sort-icon" />}
                    {props.policy !== "Priority" && <span className="disabled-indicator">⚪</span>}
                </div>
            </OverlayTrigger>

            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Current state: Running, Ready, Waiting, or Terminated</Tooltip>}
            >
                <div className="pcb-table-cell header-cell">
                    Status
                    <div className="status-legend">
                        <span className="legend-item running">▶️</span>
                        <span className="legend-item ready">⏳</span>
                        <span className="legend-item waiting">⏸️</span>
                        <span className="legend-item terminated">✅</span>
                    </div>
                </div>
            </OverlayTrigger>

            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Time spent waiting in ready queue</Tooltip>}
            >
                <div className="pcb-table-cell header-cell sortable">
                    Waiting Time
                    <SortIcon className="sort-icon" />
                </div>
            </OverlayTrigger>

            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>When I/O event occurs during execution</Tooltip>}
            >
                <div className="pcb-table-cell header-cell">
                    I/O Event
                </div>
            </OverlayTrigger>

            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Remaining I/O operation time</Tooltip>}
            >
                <div className="pcb-table-cell header-cell">
                    I/O Time
                </div>
            </OverlayTrigger>

            {/* Actions column */}
            <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Process actions</Tooltip>}
            >
                <div className="pcb-table-cell header-cell">
                    Actions
                </div>
            </OverlayTrigger>
        </div>     
    )
}