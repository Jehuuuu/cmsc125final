// Updated MemoryHeader.js - Change column headers for paged memory
export function MemoryHeader(props) {
  return(
      <div>
          <div className="memory-table-header ">
              <div className="pcb-cell">Page #</div>
              <div className="pcb-cell">Page Size</div>
              <div className="pcb-cell">Process ID</div>
              <div className="pcb-cell">Allocated Size</div>
              <div className="pcb-cell">Status</div>
              <div className="pcb-cell">Internal Fragmentation</div>
          </div>  
      </div>
  )
}