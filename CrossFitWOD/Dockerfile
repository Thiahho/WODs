# ── Build + migrations bundle ─────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY CrossFitWOD.API.csproj .
RUN dotnet restore CrossFitWOD.API.csproj

COPY . .
RUN dotnet publish CrossFitWOD.API.csproj -c Release -o /app/publish --no-restore

# Compilar el bundle de migraciones (ejecutable self-contained, no necesita EF tools en runtime)
RUN dotnet tool install --global dotnet-ef --version 8.0.* \
 && export PATH="$PATH:/root/.dotnet/tools" \
 && dotnet ef migrations bundle \
      --project CrossFitWOD.API.csproj \
      --self-contained \
      -r linux-x64 \
      -o /app/efbundle

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .
COPY --from=build /app/efbundle ./efbundle

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Aplica migraciones pendientes y luego levanta la API
# efbundle usa la variable ConnectionStrings__Default del entorno
ENTRYPOINT ["sh", "-c", "./efbundle --connection \"$ConnectionStrings__Default\" && dotnet CrossFitWOD.API.dll"]
