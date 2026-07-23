package pe.edu.unas.ctic.diagti.auditor.dto;

import java.time.LocalDate;

public class AuditorAuditoriaRequestDTO {
    private String searchText;
    private String modulo;
    private String accion;
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;
    private int page = 1;
    private int size = 10;

    // Getters y Setters
    public String getSearchText() { return searchText; }
    public void setSearchText(String searchText) { this.searchText = searchText; }

    public String getModulo() { return modulo; }
    public void setModulo(String modulo) { this.modulo = modulo; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public LocalDate getFechaDesde() { return fechaDesde; }
    public void setFechaDesde(LocalDate fechaDesde) { this.fechaDesde = fechaDesde; }

    public LocalDate getFechaHasta() { return fechaHasta; }
    public void setFechaHasta(LocalDate fechaHasta) { this.fechaHasta = fechaHasta; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}