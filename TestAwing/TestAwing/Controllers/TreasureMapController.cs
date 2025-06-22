using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace TestAwing.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TreasureMapController : ControllerBase
    {
        private readonly ITreasureMapService _service;

        public TreasureMapController(ITreasureMapService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTreasureMapRequest request)
        {
            try
            {
                var fuel = await _service.CreateAsync(request);
                return Ok(fuel);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}
