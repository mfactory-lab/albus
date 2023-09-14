import { EventManager as AnchorEventManager, BorshCoder } from '@coral-xyz/anchor'
import type { AlbusClient } from './client'
import idl from './idl/albus.json'

export class EventManager {
  _coder: BorshCoder
  _events: AnchorEventManager

  constructor(readonly client: AlbusClient) {
    this._coder = new BorshCoder(idl as any)
    this._events = new AnchorEventManager(client.programId, client.provider, this._coder)
  }

  /**
   * Invokes the given callback every time the given event is emitted.
   *
   * @param eventName The PascalCase name of the event, provided by the IDL.
   * @param callback  The function to invoke whenever the event is emitted from
   *                  program logs.
   */
  public addEventListener(
    eventName: string,
    callback: (event: any, slot: number, signature: string) => void,
  ): number {
    return this._events.addEventListener(eventName, (event: any, slot: number, signature: string) => {
      // skip simulation signature
      if (signature !== '1111111111111111111111111111111111111111111111111111111111111111') {
        callback(event, slot, signature)
      }
    })
  }

  /**
   * Unsubscribes from the given listener.
   * @param listener
   */
  public async removeEventListener(listener: number): Promise<void> {
    return await this._events.removeEventListener(listener)
  }
}
