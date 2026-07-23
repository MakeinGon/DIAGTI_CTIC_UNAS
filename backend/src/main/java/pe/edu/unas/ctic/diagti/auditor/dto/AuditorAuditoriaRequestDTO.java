package pe.edu.unas.ctic.diagti.auditor.dto;

import java.time.LocalDate;

public class AuditorAuditoriaRequestDTO {
    private String searchText;
    private String modulo;
    private String accion;
    private String usuario;
    private Long sistemaId;
    private String ipOrigen;
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;
    private int page = 1;
    private int size = 10;

    public String getSearchText() { return searchText; }
    public void setSearchText(String searchText) { this.searchText = searchText; }

    public String getModulo() { return modulo; }
    public void setModulo(String modulo) { this.modulo = modulo; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }

    public Long getSistemaId() { return sistemaId; }
    public void setSistemaId(Long sistemaId) { this.sistemaId = sistemaId; }

    public String getIpOrigen() { return ipOrigen; }
    public void setIpOrigen(String ipOrigen) { this.ipOrigen = ipOrigen; }

    public LocalDate getFechaDesde() { return fechaDesde; }
    public void setFechaDesde(LocalDate fechaDesde) { this.fechaDesde = fechaDesde; }

    public LocalDate getFechaHasta() { return fechaHasta; }
    public void setFechaHasta(LocalDate fechaHasta) { this.fechaHasta = fechaHasta; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}
