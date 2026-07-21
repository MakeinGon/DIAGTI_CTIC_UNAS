FROM eclipse-temurin:17-jdk


# Instalar Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de Maven
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd

# Descargar dependencias
RUN mvn dependency:go-offline -B

# Copiar código fuente
COPY src src

# Compilar el proyecto
RUN mvn clean package -DskipTests

# Puerto expuesto
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["java", "-jar", "target/diagti-api-0.0.1-SNAPSHOT.jar"]
