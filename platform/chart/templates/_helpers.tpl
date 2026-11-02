{{/*
Expand the name of the chart.
*/}}
{{- define "dwt-mfe.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "dwt-mfe.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "dwt-mfe.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "dwt-mfe.labels" -}}
helm.sh/chart: {{ include "dwt-mfe.chart" . }}
{{ include "dwt-mfe.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "dwt-mfe.selectorLabels" -}}
app.kubernetes.io/name: {{ include "dwt-mfe.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "autoscaling.enabled" }}
{{- if .Values.autoscaling }}
{{- default ( default "false" .Values.global.autoscalingEnabled ) .Values.autoscaling.enabled }}
{{- else }}
{{- print "false" }}
{{- end }}
{{- end }}
