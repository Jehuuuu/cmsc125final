import {useEffect, useState} from "react"

export function MemoryRows({ rows, freeMem }) {
  const [sum, setSum] = useState(0)
  const [elementRows, setElementRows] = useState([])
  
  useEffect(() => {
    var newRows = []
    var cumulativeLocation = 0;

    for (var idx = 0; idx < rows.length; idx++){
      var row = rows[idx]
      
      // Calculate page number based on location
      row.page_number = Math.floor(cumulativeLocation / row.page_size)
      row.location = cumulativeLocation

      newRows.push(row)
      cumulativeLocation += row.page_size
    }

    setElementRows(newRows)
  }, [rows])
    
  return(
    <div>
      {
        elementRows.map(row => {
          // Calculate internal fragmentation for allocated pages
          const internalFrag = row.status.toLowerCase() === "busy" && row.allocated_size 
            ? row.page_size - row.allocated_size 
            : 0;

          return (
            <div className={"memory-row " + (row.status.toLowerCase() === "busy" ? "memory-busy" : "")} key={row.id}>
                  {/* Display page number */}
                  <div className="memory-table-cell">{row.page_number}</div>

                  {/* Display fixed page size */}
                  <div className="memory-table-cell">{row.page_size}</div>

                  {/* Display process ID */}
                  <div className="memory-table-cell">{row.process_id}</div>

                  {/* Display allocated size within the page */}
                  <div className="memory-table-cell">{row.allocated_size || '-'}</div>

                  {/* Display status */}
                  <div className={"memory-table-cell "+(row.status.toLowerCase() === "busy" ? "status-busy" : "status-free")}>{row.status}</div>

                  {/* Display internal fragmentation */}
                  <div className="memory-table-cell">{internalFrag > 0 ? internalFrag : '-'}</div>
            </div>
          )
        })
      }
    </div>
  )
}