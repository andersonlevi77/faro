<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Recibo de pago {{ $alquiler->codigo }}-{{ $pago->id }}</title>
        <style>
            @page {
                size: letter;
                margin: 12mm;
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                color: #111827;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                background: #f3f4f6;
            }

            .document {
                width: 100%;
                max-width: 216mm;
                margin: 0 auto;
                padding: 10px;
                background: #fff;
            }

            .toolbar {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-bottom: 10px;
            }

            .toolbar button {
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 12px;
                cursor: pointer;
                background: #fff;
            }

            .sheet {
                border: 1px solid #9ca3af;
                border-radius: 10px;
                padding: 14px;
            }

            .header,
            .top-grid,
            .summary-grid,
            .signature-grid {
                display: grid;
                gap: 16px;
            }

            .header,
            .summary-grid {
                grid-template-columns: 1.2fr 1fr;
            }

            .top-grid,
            .signature-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .brand {
                display: flex;
                gap: 14px;
                align-items: center;
            }

            .brand img {
                width: 100px;
                height: auto;
                object-fit: contain;
            }

            .brand h1,
            .brand p,
            .meta h2,
            .meta p,
            .box p,
            .totals p {
                margin: 0;
            }

            .brand h1,
            .meta h2 {
                font-size: 18px;
                margin-bottom: 4px;
            }

            .muted {
                color: #4b5563;
            }

            .meta,
            .box,
            .totals {
                border: 1px solid #9ca3af;
                border-radius: 10px;
                padding: 10px 12px;
            }

            .meta-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
                margin-top: 8px;
            }

            .section {
                margin-top: 12px;
            }

            .label {
                font-size: 10px;
                font-weight: 700;
                color: #374151;
                text-transform: uppercase;
                letter-spacing: .04em;
                margin-bottom: 3px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            .payment-table {
                border: 1px solid #9ca3af;
                border-radius: 10px;
                overflow: hidden;
            }

            th,
            td {
                border: 1px solid #d1d5db;
                padding: 8px;
                vertical-align: top;
            }

            th {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: .03em;
                background: #f9fafb;
            }

            .text-right {
                text-align: right;
            }

            .totals-row {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                padding: 5px 0;
                border-bottom: 1px solid #e5e7eb;
            }

            .totals-row:last-child {
                border-bottom: 0;
            }

            .totals-row.total {
                font-weight: 700;
                font-size: 14px;
            }

            .signature {
                padding-top: 28px;
                border-top: 1px solid #9ca3af;
                text-align: center;
            }

            @media print {
                body {
                    background: #fff;
                }

                .toolbar {
                    display: none;
                }

                .document {
                    padding: 0;
                }

                .sheet {
                    border: 0;
                    border-radius: 0;
                    padding: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="document">
            <div class="toolbar">
                <button type="button" onclick="window.print()">Imprimir</button>
                <button type="button" onclick="window.close()">Cerrar</button>
            </div>

            <div class="sheet">
                <div class="header">
                    <div class="brand">
                        <img src="{{ asset('logo.jpeg') }}" alt="Logo {{ config('app.name') }}">
                        <div>
                            <h1>{{ config('app.name', 'Construnor') }}</h1>
                            <p class="muted">Gestión de alquileres</p>
                            <p class="muted">Recibo de pago entregado al cliente.</p>
                        </div>
                    </div>

                    <div class="meta">
                        <h2>Recibo de pago</h2>
                        <p class="muted">Comprobante de caja vinculado al alquiler.</p>
                        <div class="meta-grid">
                            <div>
                                <p class="label">Serie</p>
                                <p>PAG</p>
                            </div>
                            <div>
                                <p class="label">Número</p>
                                <p>{{ $alquiler->codigo }}-{{ $pago->id }}</p>
                            </div>
                            <div>
                                <p class="label">Fecha de emisión</p>
                                <p>{{ $pago->created_at?->format('d/m/Y H:i') }}</p>
                            </div>
                            <div>
                                <p class="label">Registrado por</p>
                                <p>{{ $pago->registradoPor?->name ?? '—' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section top-grid">
                    <div class="box">
                        <p class="label">Cliente</p>
                        <p><strong>{{ $alquiler->cliente?->nombre ?? 'Consumidor final' }}</strong></p>
                        <p class="muted">Código: {{ $alquiler->cliente?->codigo ?? '—' }}</p>
                        <p class="muted">Documento: {{ $alquiler->cliente?->documento ?? 'CF' }}</p>
                        <p class="muted">Teléfono: {{ $alquiler->cliente?->telefono ?? '—' }}</p>
                    </div>

                    <div class="box">
                        <p class="label">Contrato</p>
                        <p><strong>Código de alquiler:</strong> {{ $alquiler->codigo }}</p>
                        <p class="muted">Período: {{ $alquiler->fecha_inicio_prevista?->format('d/m/Y') }} al {{ $alquiler->fecha_fin_prevista?->format('d/m/Y') }}</p>
                        <p class="muted">Líneas: {{ $alquiler->lineas->count() }}</p>
                    </div>
                </div>

                <div class="section">
                    <table class="payment-table">
                        <thead>
                            <tr>
                                <th style="width: 56px;">Pos.</th>
                                <th style="width: 180px;">Concepto</th>
                                <th>Método</th>
                                <th>Notas</th>
                                <th style="width: 120px;">Importe</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="text-align: center;">1</td>
                                <td>{{ $tipoLabel }}</td>
                                <td>{{ $metodoLabel }}</td>
                                <td>{{ $pago->notas ?: 'Sin notas' }}</td>
                                <td class="text-right">Q {{ number_format((float) $pago->monto, 2) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="section summary-grid">
                    <div class="box">
                        <p class="label">Detalle del pago</p>
                        <p>Este recibo confirma que el cliente realizó un pago por <strong>{{ $tipoLabel }}</strong>.</p>
                        <p class="muted" style="margin-top: 8px;">
                            Método: {{ $metodoLabel }}<br>
                            Fecha: {{ $pago->created_at?->format('d/m/Y H:i') }}<br>
                            Alquiler relacionado: {{ $alquiler->codigo }}
                        </p>
                    </div>

                    <div class="totals">
                        <div class="totals-row">
                            <p>Pago recibido</p>
                            <p>Q {{ number_format((float) $pago->monto, 2) }}</p>
                        </div>
                        <div class="totals-row">
                            <p>Total cobrado</p>
                            <p>Q {{ number_format((float) $resumen['total_cobrado'], 2) }}</p>
                        </div>
                        <div class="totals-row">
                            <p>Total alquiler</p>
                            <p>Q {{ number_format((float) $resumen['total_alquiler'], 2) }}</p>
                        </div>
                        <div class="totals-row">
                            <p>Garantía</p>
                            <p>Q {{ number_format((float) $resumen['deposito'], 2) }}</p>
                        </div>
                        <div class="totals-row total">
                            <p>Saldo pendiente</p>
                            <p>Q {{ number_format((float) $resumen['saldo_pendiente'], 2) }}</p>
                        </div>
                    </div>
                </div>

                <div class="signature-grid section">
                    <div class="signature">
                        Firma del cliente
                    </div>
                    <div class="signature">
                        Firma y sello de caja
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
