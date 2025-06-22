using Dapper;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;

namespace Infrastructure.Repositories
{
    public class TreasureMapRepository : ITreasureMapRepository
    {
        private readonly IConfiguration _configuration;

        public TreasureMapRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<TreasureMapEntity> AddAsync(TreasureMapEntity map)
        {
            using var connection = new MySqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync(@"
                INSERT INTO TreasureMaps (RowCount, ColCount, P, MatrixJson, FuelCost)
                VALUES (@RowCount, @ColCount, @P, @MatrixJson, @FuelCost);
            ", map);

            return map;
        }
    }
}
