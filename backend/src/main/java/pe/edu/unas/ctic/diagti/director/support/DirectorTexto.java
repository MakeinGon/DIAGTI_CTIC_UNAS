package pe.edu.unas.ctic.diagti.director.support;

public final class DirectorTexto {

    private DirectorTexto() {
    }

    public static String safe(String value) {
        return value == null ? "" : value.trim();
    }

    public static String upper(String value) {
        String s = safe(value);
        return s.isEmpty() ? "" : s.toUpperCase();
    }

    public static String normalize(String value) {
        String base = safe(value).replace('\u00a0', ' ');
        String nfd = java.text.Normalizer.normalize(base, java.text.Normalizer.Form.NFD);
        return nfd
                .replaceAll("\\p{M}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }

    public static boolean matchesFilter(String filter, String rawValue) {
        if (filter == null || filter.isBlank() || "all".equalsIgnoreCase(filter)) {
            return true;
        }
        String nFilter = normalize(filter);
        String nValue = normalize(rawValue);
        return nFilter.equals(nValue) || nValue.contains(nFilter) || nFilter.contains(nValue);
    }
}
