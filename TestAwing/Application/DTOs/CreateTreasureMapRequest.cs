using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs
{
    public class CreateTreasureMapRequest
    {
        public int RowCount { get; set; }
        public int ColCount { get; set; }
        public int P { get; set; }
        public string MatrixJson { get; set; } = string.Empty;
    }
}
