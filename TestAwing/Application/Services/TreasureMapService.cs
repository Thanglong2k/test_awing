using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class TreasureMapService : ITreasureMapService
    {
        private readonly ITreasureMapRepository _repository;

        public TreasureMapService(ITreasureMapRepository repository)
        {
            _repository = repository;
        }

        public async Task<CreateTreasureMapResponse> CreateAsync(CreateTreasureMapRequest request)
        {
            var matrix = JsonSerializer.Deserialize<int[][]>(request.MatrixJson);

            Validate(request, matrix!);
            double fuelCost = CalculateMinFuel(request.RowCount, request.ColCount, request.P, matrix!);

            var map = new TreasureMapEntity
            {
                RowCount = request.RowCount,
                ColCount = request.ColCount,
                P = request.P,
                MatrixJson = request.MatrixJson,
                FuelCost = fuelCost
            };

            await _repository.AddAsync(map);

            return new CreateTreasureMapResponse { FuelCost = fuelCost };
        }

        private double CalculateMinFuel(int n, int m, int p, int[][] a)
        {
            /*var chestPositions = new Dictionary<int, List<(int x, int y)>>();

            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < m; j++)
                {
                    int val = a[i][j];
                    if (!chestPositions.ContainsKey(val))
                        chestPositions[val] = new List<(int, int)>();
                    chestPositions[val].Add((i, j));
                }
            }    

            var fuel = new Dictionary<(int, int), double>();

            foreach (var pos in chestPositions[1])
            {
                fuel[pos] = GetDistance((0, 0), pos);
            }    

            for (int num = 2; num <= p; num++)
            {
                if (!chestPositions.ContainsKey(num)) continue;
                var current = chestPositions[num];
                var prev = chestPositions[num - 1];

                var newFuel = new Dictionary<(int, int), double>();
                foreach (var (x, y) in current)
                {
                    double min = double.MaxValue;
                    foreach (var (px, py) in prev)
                    {
                        if (!fuel.ContainsKey((px, py))) continue;
                        double cost = fuel[(px, py)] + GetDistance((x, y), (px, py));
                        if (cost < min) min = cost;
                    }
                    newFuel[(x, y)] = min;
                }
                fuel = newFuel;
            }
            return fuel.Values.Min();*/
            var chestPositions = new Dictionary<int, List<(int x, int y)>>();

            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < m; j++)
                {
                    int val = a[i][j];
                    if (!chestPositions.ContainsKey(val))
                        chestPositions[val] = new List<(int, int)>();
                    chestPositions[val].Add((i, j));
                }
            }

            var fuel = new Dictionary<(int, int), double>();

            // Tìm loại rương nhỏ nhất hiện diện trong ma trận
            int startType = Enumerable.Range(1, p).FirstOrDefault(t => chestPositions.ContainsKey(t));
            if (startType == 0)
                throw new Exception("Không có rương nào để bắt đầu.");

            // Bắt đầu từ vị trí (0, 0)
            foreach (var pos in chestPositions[startType])
                fuel[pos] = GetDistance((0, 0), pos);

            for (int num = startType + 1; num <= p; num++)
            {
                if (!chestPositions.ContainsKey(num)) continue;

                var current = chestPositions[num];
                var prev = fuel.Keys;

                var newFuel = new Dictionary<(int, int), double>();
                foreach (var (x, y) in current)
                {
                    double min = double.MaxValue;
                    foreach (var (px, py) in prev)
                    {
                        if (!fuel.ContainsKey((px, py))) continue;

                        double cost = fuel[(px, py)] + GetDistance((x, y), (px, py));
                        if (cost < min) min = cost;
                    }
                    newFuel[(x, y)] = min;
                }

                fuel = newFuel;
            }

            return fuel.Values.Min();
        }

        private double GetDistance((int x, int y) a, (int x, int y) b)
        {
            return Math.Sqrt(Math.Pow(a.x - b.x, 2) + Math.Pow(a.y - b.y, 2));
        }

        private void Validate(CreateTreasureMapRequest request, int[][] matrix)
        {
            if (request.RowCount < 1 || request.RowCount > 500)
                throw new ValidationException("RowCount phải từ 1 đến 500.");

            if (request.ColCount < 1 || request.ColCount > 500)
                throw new ValidationException("ColCount phải từ 1 đến 500.");

            if (request.P < 1 || request.P > request.RowCount * request.ColCount)
                throw new ValidationException("P phải từ 1 đến " + request.RowCount * request.ColCount);

            if (matrix.Length != request.RowCount)
                throw new ValidationException("Matrix không khớp số hàng.");

            int pCount = 0;

            for (int i = 0; i < request.RowCount; i++)
            {
                if (matrix[i].Length != request.ColCount)
                    throw new ValidationException($"Hàng {i} không có đúng {request.ColCount} cột.");

                foreach (var cell in matrix[i])
                {
                    if (cell < 1 || cell > request.P)
                        throw new ValidationException($"Tất cả ô phải có giá trị từ 1 đến {request.P}.");

                    if (cell == request.P)
                        pCount++;
                }
            }

            if (pCount != 1)
                throw new ValidationException("Phải có đúng 1 ô có giá trị bằng P.");
        }
    }
}
